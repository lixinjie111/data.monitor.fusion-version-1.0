<template>
    <div class="c-box">
        <left></left>
        <right></right>
        <bottom></bottom>
    </div>
</template>
<script>
    import left from './components/left'
    import Right from './components/right'
    import bottom from './components/bottom'
    export default {
        data() {
            return {
                perceptionData:{},
                vehData:{},
                warningCount:0
            }
        },
        components:{
            left,Right,bottom
        },
        methods: {

        },
    }
</script>