<template>
	<div class="wrapper" >
		<h1 class="title">404</h1>
		<p class="text">😁 抱歉，您访问的页面不存在</p>
	</div>
</template>

<script>
	export default {
		name: '404',
		data () {
			return {}
		},
		mounted() {
			
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped >
	.wrapper {
		padding: 20% 20px 0;
		color: #1e5792;
		text-align: center;
		.title {
			font-weight: bold;
			font-size: 80pt;
		}
		.text {
			font-size: 18pt;
		}
	}
</style>