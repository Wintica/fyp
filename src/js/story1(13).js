function updateSlider(value) {
  // Update the displayed value
  document.getElementById('sliderValue').innerText = value;
  
  // Check if slider is EXACTLY at 100
  if (value == "100") {
    // Add success styling and message
    document.getElementById('sliderValue').className = 'mt-6 text-2xl font-bold text-green-600';
    document.getElementById('sliderValue').innerText = value + " Perfect!";
    
    // Navigate to next page after a short delay
    setTimeout(() => {
      window.location.href = '14.html';
    }, 1000);

  } else if (value < 50){
    // State that the slider should turn the other way 
    document.getElementById('sliderValue').className = 'mt-6 text-2xl font-bold text-green-600';
    document.getElementById('sliderValue').innerText = value + " (You are turning the wrong way)";

  } else {
    // Reset styling if not exactly 100
    document.getElementById('sliderValue').className = 'mt-6 text-xl font-bold text-gray-800';
    
    // Show how close they are to 50
    const diff = Math.abs(100 - parseInt(value));
    if (diff <= 5 && value != "100") {
      document.getElementById('sliderValue').innerText = value + " (Close! Need exactly 100)";
      document.getElementById('sliderValue').className = 'mt-6 text-xl font-bold text-orange-600';
    }
  }
}
