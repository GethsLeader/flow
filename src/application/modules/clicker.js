export function applySpecialClick() {
    window.specialClick = function () {
        console.log('Test button click! Should to work with HMR support.');
    };
}