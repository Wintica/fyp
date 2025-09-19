document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const config = {
        getPathPoints: function() {
            if (window.JourneyMap.isMobileDevice()) {
                return [
                    {x: 0.5, y: 0.1, isPercent: true},
                    {x: 0.5, y: 0.3, isPercent: true},
                    {x: 0.5, y: 0.5, isPercent: true},
                    {x: 0.5, y: 0.7, isPercent: true},
                    {x: 0.5, y: 0.9, isPercent: true}
                ];
            } else {
                return [
                    {x: 200, y: 500}, {x: 280, y: 480}, {x: 360, y: 450}, {x: 420, y: 420},
                    {x: 450, y: 400}, {x: 480, y: 380}, {x: 540, y: 340}, {x: 600, y: 300},
                    {x: 580, y: 260}, {x: 540, y: 220}, {x: 500, y: 200}, {x: 460, y: 180},
                    {x: 430, y: 150}, {x: 400, y: 100}
                ];
            }
        },
        getCheckpoints: function() {
            if (window.JourneyMap.isMobileDevice()) {
                return [
                    {pos: {x: 0.5, y: 0.1, isPercent: true}, name: "Checkpoint 1"},
                    {pos: {x: 0.5, y: 0.5, isPercent: true}, name: "Checkpoint 2"},
                    {pos: {x: 0.5, y: 0.9, isPercent: true}, name: "Checkpoint 3"}
                ];
            } else {
                return [
                    {pos: {x: 200, y: 500}, name: "Checkpoint 1"},
                    {pos: {x: 600, y: 300}, name: "Checkpoint 2"},
                    {pos: {x: 400, y: 100}, name: "Checkpoint 3"}
                ];
            }
        },
        getExercises: function() {
            if (window.JourneyMap.isMobileDevice()) {
                return [
                    {pos: {x: 0.5, y: 0.3, isPercent: true}, name: "Exercise 1"},
                    {pos: {x: 0.5, y: 0.7, isPercent: true}, name: "Exercise 2"}
                ];
            } else {
                return [
                    {pos: {x: 450, y: 400}, name: "Exercise 1"},
                    {pos: {x: 500, y: 200}, name: "Exercise 2"}
                ];
            }
        },
        sequence: [
            // {type: 'exercise', index: 0, name: 'Exercise 1'},
            // {type: 'checkpoint', index: 1, name: 'Checkpoint 2'}
            {type: 'checkpoint', index: 1, name: 'Checkpoint 2'},
            {type: 'exercise', index: 1, name: 'Exercise 2'}
        ],
        getInitialPlayerPos: function() {
             // Start at Checkpoint 2
            return this.getCheckpoints()[1].pos;
        }
    };
    window.journeyMap2 = JourneyMap(canvas, ctx, config);
});
