console.log("JS LOADED");
let allData;
const loading = document.getElementById("loading");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchinput");

const resultsContainer = document.getElementById("resultsContainer");
const loader = document.getElementById("loading");
const searchRegion = document.getElementById("searchRegion");
const resultText = document.getElementById("resultText");
const region = searchRegion.value;
const foodSection = document.getElementById("foodSection");
const mealMapCountry = {
    American: "American",
    British: "British",
    Canadian: "Canadian",
    Chinese: "Chinese",
    Croatian: "Croatian",
    Dutch: "Dutch",
    Egyptian: "Egyptian",
    Filipino: "Filipino",
    French: "French",
    Greek: "Greek",
    Indian: "Indian",
    Irish: "Irish",
    Italian: "Italian",
    Jamaican: "Jamaican",
    Japanese: "Japanese",
    Kenyan: "Kenyan",
    Malaysian: "Malaysian",
    Mexican: "Mexican",
    Moroccan: "Moroccan",
    Polish: "Polish",
    Portuguese: "Portuguese",
    Russian: "Russian",
    Spanish: "Spanish",
    Thai: "Thai",
    Tunisian: "Tunisian",
    Turkish: "Turkish",
    Ukrainian: "Ukrainian",
    Uruguayan: "Uruguayan",
    Vietnamese: "Vietnamese"
};


const getAllInfo = async () => {
    
    const allInfo = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region,subregion,languages,demonyms');
    if (!allInfo.ok) {
        throw new Error("HTTP error: " + allInfo.status);
    }
    
    const jsonData = await allInfo.json();
    allData = jsonData;
    console.log(allData);
}

const printOutFunc = async () => {
    try {
        await getAllInfo();
        console.log(allData);
    } catch (error) {
        console.error("something went wrong :", error);
    }
};

const getMealsByDemonym = async (country) => {
    const demonym = country.demonyms?.eng?.m;
    console.log("Demonym: ", demonym);
    
    const area = mealMapCountry[demonym];
    console.log("Mapped area",area);

    if (!area) {
        return { meals:null };
    }
    try {
        let result = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?s=${area}');
        let data = await result.json;
        console.log("area result: ",data);
        if (!data.meals) {
            console.log("Fallback to search");
            result=await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?s=${area}');
            data= await result.json();
        }
        return { meals: Array.isArray(data.meals) ? data.meals : null };


    } catch (er) {
        console.log("Meal fetch error: ", er);
        return { meals: null, message: "Local delicacies" };
    }
};




//try catch will catch synchronous errors only, do not add try catch fro printoutfunc as
// it returns a promise and tc block does not wait for it
//whenever await is used , try catch has to be there,thats it


printOutFunc();


const searchCountry = () => {
    //console.log("search clicked");
    //console.log(searchInput.value)

    const input = searchInput.value.toLowerCase().trim();

    if (!allData) {
        resultsContainer.innerHTML = "Loading data... please wait";
        return;
    }
    if (input === "") {
        resultsContainer.innerHTML = `<p class="py-2 my-4 bg-cyan-400/30 rounded-xl text-red-700 text-lg items-center justify-center">Type something!</p>`;
        return;
    };
    resultsContainer.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 ";

    resultsContainer.innerHTML = "";

    let found = false;


    for (const data of allData) {
        if (data.name.common.toLowerCase().startsWith(input)) {


            found = true;
            resultsContainer.innerHTML +=
                `
           <div class="countryCard bg-white rounded-xl shadow-md overflow-hidden p-3" data-name="${data.name.common}">
                <img src="${data.flags.png}" class="w-full h-40 object-cover rounded-md mb-2">
                <h2 class="font-bold text-lg">${data.name.common}</h2>
                <p>Capital: ${data.capital ? data.capital[0] : "N/A"}</P>
                <p>Population: ${data.population.toLocaleString()}</p>
            </div>
            `;
        }
    }


    if (found != true) {
        resultsContainer.className = "flex justify-center items-center h-40";
        resultsContainer.innerHTML = `
        <p class="bg-cyan-400/30 rounded-xl text-red-700 text-lg">  Country not recognised,check spelling   </p>
        `;
    }


};

searchBtn.addEventListener("click", searchCountry);
/*searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchCountry();
    }
})*/
searchInput.addEventListener("input",(e)=>{
    const value = e.target.value.toLowerCase();

    const filtered = allData.filter(c =>
        c.name.common.toLowerCase().startsWith(value)
    ); 
    searchCountry(filtered);
    
});

const modal = document.getElementById("modal");

async function openModal(name) {
    const country = allData.find(
        (c) => c.name.common === name
    );
    console.log("open modal called with:", country);
    console.log("open modal found country:", country)
    if (!country) return;
    modal.classList.remove("hidden");
    foodSection.innerHTML = "<p>Loading food...</p>"
    const resultM = await getMealsByDemonym(country);

    resultText.innerHTML = `
    <div class=" overflow-hidden p-3 cursor-pointer">
        <h3 class="items-center justify-center p-4 text-bold"><b>Know the Country !</b></h3>
        <p><b>Capital : </b> ${country.capital ? country.capital[0] : "N/A"} </p>
        <p><b>Region: </b> ${country.region} </p>
        <p><b>Subregion: </b> ${country.subregion} </p>
        <p><b>Population: </b> ${country.population.toLocaleString()}</p>
        <p><b>Languages: </b> ${country.languages ? Object.values(country.languages).join(", ") : "N/A"}</p>
    </div>
    `;
    console.log(resultM);
    //if (!resultM.meals) {
        //foodSection.innerHTML = `<p class="p-3">${resultM.message || "<b>Popular food </b>:local delicacies"}</p>`;
    //}
    if (!Array.isArray(resultM.meals)) {
        foodSection.innerHTML = `<p class="p-3">${resultM.message || "<b>Popular food </b>:local delicacies"}</p>`;
        return;
    }
    
    else {
        foodSection.innerHTML = resultM.meals.slice(0, 3).map(meal => `
                    <div>
                    <p>${meal.strMeal}</p>
                    </div>`).join("");
    }


    modal.classList.remove("hidden");
};

resultsContainer.addEventListener("click", (e) => {
    console.log("card clicked");
    const card = e.target.closest(".countryCard");
    console.log("card: ", card);
    if (!card) return;

    const countryName = card.dataset.name;
    console.log("resulcont addevelist cname  : ", countryName);
    openModal(countryName);

});


const closeModal = document.getElementById("closeModal");
closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
})
