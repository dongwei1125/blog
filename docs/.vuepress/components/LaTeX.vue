<template>
  <div class="math">
    <span ref="latex" class="latex" />
  </div>
</template>

<script>
import katex from 'katex'
import 'katex/dist/katex.css'

export default {
  name: 'LaTeX',
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const slot = this.$slots.default[0].text

      katex.render(slot, this.$refs.latex, {
        throwOnError: false,
      })
    },
  },
}
</script>

<style>
.math {
  display: block;
  padding: 1em 0;
}

.latex {
  display: block;
  text-align: center;
}
</style>
