<template>
  <svg :class="['svg-icon', className]" aria-hidden="true" @click="clickHandle">
    <use :xlink:href="'#icon-' + (iconName || name)" />
  </svg>
</template>

<script>
  export default {
    name: 'SvgIcon',
    props: {
      iconName: {
        type: String,
        required: false
      },
      name: {
        type: String,
        required: false
      },
      className: {
        type: [String, Array],
        default: ''
      }
    },
    mounted() {
      if (!this.name && !this.iconName) {
        console.error('Missing required prop: "iconName or name"');
      }
    },
    methods: {
      clickHandle() {
        this.$emit('click');
      }
    }
  };
</script>

<style scoped>
  .svg-icon {
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: -0.15em;
    overflow: visible;
    position: relative;
  }
</style>
