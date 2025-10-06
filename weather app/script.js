// let dateTime = new Date();
// console.log('dateTime', dateTime);
// console.log('dateTime hours', dateTime.getHours());
// console.log('dateTime day', dateTime.getDay());
// console.log('dateTime full year', dateTime.getFullYear());
// console.log('dateTime minutes', dateTime.getMinutes());

// fetch('https://www.google.com')
//     .then(data => {
//     console.log('data');
//     console.log(data);
// }).catch(error =>{
//     console.log('error');
//     console.log(error);
// });

// moiz('moheed');
// moiz('moiz');
// moiz('assad');
// moiz('rafi');

// function moiz(name){
//     console.log(name);
// }

// function test(){
//     let a = document.getElementById('div').innerHTML = 'Moiz 12345';
// }

function getweather() {
    const apikey = '59b3a3abdaa277e6f57168f1e6db9a78';
    // https://api.openweathermap.org/data/2.5/weather?q=islamabad&appid=59b3a3abdaa277e6f57168f1e6db9a78
    let city = document.getElementById('city').value;
  

    if (!city) {
        alert('please enter a city')
        return;
    }
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}`;


    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error feching current weather data.Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHiurlyForecast(data.list);
           
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error feching current weather data.Please try again.');
        });

}

function displayWeather(data) {
    let tempDivInfo = document.getElementById('temp-div');
    let weatherInfoDiv = document.getElementById('weather-info');
    let weatherIcon = document.getElementById('weather-icon');
    let hourlyForecastDiv = document.getElementById('hourly-forecast');

    // clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        let cityName = data.name;
        let temperature = Math.round(data.main.temp - 273.15);
        let description = data.weather[0].description
        let iconCode = data.weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;
        let temperatureHTML = `
    <p>${temperature}°C</p>
    `;
        let weatherHTML = `
    <p>${cityName}</p>
    <p>${description}</p>
    `;
        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHTML;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        showImage();
    }
}

function displayHiurlyForecast(hourlyData) {
    console.log(hourlyData);
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const next24Hours = hourlyData.slice(0, 8);
   
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
            <span>${hour}:00</span>
            <img src="${iconUrl}" alt="Hourly Weather Icon">
            <span>${temperature}°C</span>
            </div>
            `;
        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}
function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block';
}
