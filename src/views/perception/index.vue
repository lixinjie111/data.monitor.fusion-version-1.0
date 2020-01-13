<template>
    <div class="c-box">
        <left></left>
        <right></right>
    </div>
</template>
<script>
    import left from './components/left'
    import Right from './components/right'
    export default {
        data() {
            return {
                perceptionData:{},
                vehData:{},
                warningCount:0
            }
        },
        components:{
            left,Right
        },
        methods: {

        },
    }
</script>