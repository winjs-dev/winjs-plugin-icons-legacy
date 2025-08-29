import { join } from 'node:path';
import type { IApi } from '@winner-fed/winjs';

export default (api: IApi) => {
  api.describe({
    key: 'iconsLegacy',
    config: {
      schema({ zod }) {
        return zod.object({
          include: zod.array(zod.string()).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  const presets = api.userConfig['presets'];
  const isPresetVue2 = Array.isArray(presets)
    ? presets.filter((preset: string) => preset.indexOf('preset-vue2') !== -1)
    : [];
  const iconsPath = [
    join(api.paths.absSrcPath, 'icons'),
    ...(api.userConfig?.iconsLegacy?.include || []),
  ];

  if (isPresetVue2?.length) {
    // rsbuild
    api.modifyBundlerChain({
      fn: async (chain, { CHAIN_ID }) => {
        iconsPath.forEach((iconPath) => {
          chain.module
            .rule(CHAIN_ID.RULE.SVG)
            .test(/\.svg$/)
            .exclude.add(iconPath)
            .end();

          // 自定义 rule
          chain.module
            .rule('svg-icon')
            .test(/\.svg$/)
            .include.add(iconPath)
            .end()
            .use('svg-sprite-loader')
            .loader(
              require.resolve(
                '@winner-fed/bundler-webpack/compiled/svg-sprite-loader',
              ),
            )
            .options({
              symbolId: 'icon-[name]',
            })
            .end()
            .before('svg-sprite-loader')
            .use('svgo-loader')
            .loader(
              require.resolve(
                '@winner-fed/bundler-webpack/compiled/svgo-loader',
              ),
            )
            .options({
              plugins: [
                {
                  name: 'removeAttrs',
                  params: {
                    attrs: '(fill|stroke)',
                  },
                },
              ],
            })
            .end();
        });
        return chain;
      },
    });

    // webpack
    api.chainWebpack((config) => {
      // svg
      // 处理 src/icons
      iconsPath.forEach((iconPath) => {
        config.module.rule('image').exclude.add(iconPath).end();

        config.module
          .rule('svg')
          .test(/\.svg$/)
          .include.add(iconPath)
          .end()
          .use('svg-sprite-loader')
          .loader(
            require.resolve(
              '@winner-fed/bundler-webpack/compiled/svg-sprite-loader',
            ),
          )
          .options({
            symbolId: 'icon-[name]',
          })
          .end()
          .before('svg-sprite-loader')
          .use('svgo-loader')
          .loader(
            require.resolve('@winner-fed/bundler-webpack/compiled/svgo-loader'),
          )
          .options({
            plugins: [
              {
                name: 'removeAttrs',
                params: {
                  attrs: '(fill|stroke)',
                },
              },
            ],
          })
          .end();
      });
    });
  }
};
