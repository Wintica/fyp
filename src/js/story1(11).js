function updateSlider(value) {
  // Update the displayed value
  document.getElementById('sliderValue').innerText = value;
  
  // Check if slider is EXACTLY at 50
  if (value == "50") {
    // Disable the slider to lock it at 50
    document.getElementById('doorSlider').disabled = true;

    // Add success message
    document.getElementById('sliderValue').className = 'mt-6 text-2xl font-bold text-green-600 relative z-50';
    document.getElementById('sliderValue').innerText = value + " Perfect!";
    
    // Navigate to next page after a 2-second delay
    setTimeout(() => {
      window.location.href = '12.html';
    }, 1000);
  } else {
    // Reset styling
    document.getElementById('sliderValue').className = 'mt-6 text-2xl font-bold text-black relative z-50';
    
    // Show how close they are to 50
    const diff = Math.abs(50 - parseInt(value));
    if (diff <= 5 && value != "50") {
      document.getElementById('sliderValue').innerText = value + " (Close! Need exactly 50)";
      document.getElementById('sliderValue').className = 'mt-6 text-2xl font-bold text-orange-600 relative z-50';
    }
  }
}
