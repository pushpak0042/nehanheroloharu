document.addEventListener("DOMContentLoaded", () => {
    
    // Array of your 4 commercial videos
    const videos = [
        'commercial1.mp4', 
        'commercial2.mp4', 
        'commercial3.mp4', 
        'commercial4.mp4'
    ];
    
    let currentIndex = 0;
    const bgVideo = document.getElementById('hero-bg-video');
    const dots = document.querySelectorAll('.vid-dot');
    let loopTimer;

    // Function to load and play a specific video
    function loadVideo(index) {
        // Change the video source
        bgVideo.src = videos[index];
        bgVideo.play();
        
        // Update active dot styling
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        // Update current index
        currentIndex = index;
    }

    // Function to start the 10-second automatic loop
    function startVideoLoop() {
        // Clear any existing timer to prevent overlapping loops
        clearInterval(loopTimer); 
        
        loopTimer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % videos.length;
            loadVideo(nextIndex);
        }, 10000); // 10000 ms = 10 seconds
    }

    // Add click events to the dots for manual selection
    dots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
            const clickedIndex = parseInt(e.target.getAttribute('data-index'));
            
            // Only change if clicking a different video
            if (clickedIndex !== currentIndex) {
                loadVideo(clickedIndex);
                // Restart the timer so they have a full 10 seconds to watch the new video
                startVideoLoop(); 
            }
        });
    });

    // Start the loop when the page loads
    startVideoLoop();
});