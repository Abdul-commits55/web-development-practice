const btnEl = document.getElementById("btn");
const animeContainerEl = document.querySelector(".anime-container");
const animeImgEl = document.querySelector(".anime-img");
const amineNameEl = document.querySelector(".anime-name");

btnEl.addEventListener("click", async function () {
  console.log("oiz")
  try {
    //  animeImgEl.src =""v
    //  const img = document.getElementById("myImg");
    // animeImgEl.removeAttribute("src");
    btnEl.disabled = true;
    btnEl.innerText = "Loading...";
    amineNameEl.innerText = "Updating...";
    animeImgEl.src = "spinner.svg";
    //  const response = await fetch("https://picsum.photos/200");
    //  console.log()
    //  const data = await response.json();
    btnEl.disabled = false;
    btnEl.innerText = "Get Anime";
    animeContainerEl.style.display = "block";
   animeImgEl.src = "https://picsum.photos/200?random=" + Date.now();

    //  amineNameEl.innerText = data.artist;
  } catch (error) {
    console.log(error);
    btnEl.disabled = false;
    btnEl.innerText = "Get Anime";
    amineNameEl.innerText = "An error happened, please try again";
  }
});