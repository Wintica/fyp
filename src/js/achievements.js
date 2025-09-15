 function showAchievementBanner() {
        const banner = document.getElementById('achievementBanner');
        banner.classList.remove('hidden');
        banner.classList.add('block');

        // Hide the banner after 5 seconds
        setTimeout(() => {
            banner.classList.remove('block');
            banner.classList.add('hidden');
        }, 5000);
    }

    // Example: Trigger the banner when the page loads
    window.addEventListener('load', () => {
        showAchievementBanner();
    });