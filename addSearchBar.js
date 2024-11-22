function removeEmojisFromString(string) {
    let emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    let emoji = string.match(emojiRegex);
    string = string.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    string = string.replace(/\u200D|\uFE0F/g, '').trim();
    return string;
}
// function to take /html/body/div/div[2]/div/div[2]/div[1] and take all divs inside it
function takeDataFromDiv() {
    let div = document.evaluate("/html/body/div/div[2]/div/div[2]/div[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let divs = div.children;
    let data = [];
    // log the number of divs
    for (let i = 0; i < divs.length; i++) {

        let div = divs[i];
        
        // JOB TITLE
        let title = div.children[0].children[0].children[0].children[0].children[0].children[1].children[0].innerText

        // JOB POSTER
        let posterAndTime = div.children[0].children[0].children[0].children[0].children[0].children[1].children[1].innerText;
        // split by •
        let posterFirm = posterAndTime.split("•")[0].trim();
        let formatTime = posterAndTime.split("•")[1].trim();

        // CHARACTERISTICS
        let characteristics = div.children[0].children[0].children[0].children[1].children[0];
        // technologies are in divs with class bg-gray-100
        let techs = characteristics.getElementsByClassName("bg-gray-100");
        let techsNames = [];
        for (let j = 0; j < techs.length; j++) {
            techsNames.push(techs[j].innerText);
        }
        // experience is in div with class bg-yellow-100
        let experience = characteristics.getElementsByClassName("bg-yellow-100");
        if (experience.length > 0) {
            experience = experience[0].innerText;
        } else {
            experience = "";
        }
        // RAL is in bg-teal-100
        let ral = characteristics.getElementsByClassName("bg-teal-100");
        if (ral.length > 0) {
            ral = ral[0].innerText;
        } else {
            ral = "";
        }
        
        // DESCRIPTION
        let description = div.children[0].children[0].children[0].children[2].innerText;

        data.push({
            element: div,
            title: title,
            posterFirm: posterFirm,
            formatTime: formatTime,
            ral: ral,
            experience: experience,
            techsNames: techsNames,
            description: description});

    }
    return data;
}
function addDropdown(inputId, defaultText, values) {
    let span = document.evaluate("/html/body/div/div[2]/div/div[2]/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // add build dropdown
    let dropdown = document.createElement("select");
    // dropdown element should have rounded edges
    dropdown.style.borderRadius = "5px";
    // gray outline and text inside with size 14
    dropdown.style.borderColor = "#dddddd";
    dropdown.style.minWidth = "200px";
    dropdown.style.maxWidth = "200px";
    dropdown.style.color = "#dddddd";
    dropdown.style.fontSize = "16px";
    dropdown.id = inputId;
    dropdown.name = inputId;
    let dropdownDefault = document.createElement("option");
    dropdownDefault.value = "";
    dropdownDefault.text = defaultText;
    dropdown.appendChild(dropdownDefault);
    values = Array.from(new Set(values));
    values.forEach(posterFirm => {
        let option = document.createElement("option");
        option.value = posterFirm;
        option.text = posterFirm;
        dropdown.appendChild(option);
    });
    // once the dropdown is changed make the text black
    dropdown.addEventListener("change", function() {
        dropdown.style.color = "black";
    });
    span.appendChild(dropdown);
}
function addNumberInput(inputId, defaultText) {
    let span = document.evaluate("/html/body/div/div[2]/div/div[2]/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // add build dropdown
    let input = document.createElement("input");
    // dropdown element should have rounded edges
    input.style.borderRadius = "5px";
    // max width of 100px
    input.style.maxWidth = "200px";
    input.style.minWidth = "200px";
    // gray outline and text inside with size 14
    input.style.borderColor = "#dddddd";
    input.style.color = "#dddddd";
    input.style.fontSize = "16px";
    input.id = inputId;
    input.name = inputId;
    input.placeholder = defaultText;
    // if user is writing a non-number character, remove it
    input.addEventListener("input", function() {
        input.value = input.value.replace(/[^0-9]/g, '');
        input.style.color = "black";
    });
    span.appendChild(input);
}
function addCustomSearchBar(data) {
    let titles = data.map(x => x.title);
    let posterFirms = data.map(x => x.posterFirm);
    let formatTimes = data.map(x => x.formatTime);
    let rals = data.map(x => x.minRal);
    let experiences = data.map(x => x.minExperienceYears);
    let techsNames = data.map(x => x.techsNames);
    // flatten techsNames and remove duplicates
    techsNames = [].concat.apply([], techsNames);
    techsNames = Array.from(new Set(techsNames));

    // get /html/body/div/div[2]/div/div[2]/span and add dropdowns
    let span = document.evaluate("/html/body/div/div[2]/div/div[2]/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    // add dropdowns as children of the span
    addDropdown("titleInput", "Title", titles.sort());
    addDropdown("posterFirmInput", "Company", posterFirms.sort());
    addDropdown("formatTimeInput", "Format Time", formatTimes.sort());
    addNumberInput("ralInput", "RAL", rals.sort());
    addNumberInput("experienceInput", "Experience (years)", experiences.sort());
    addDropdown("techsNamesInput", "Technologies", techsNames.sort());

}
function normalizeExperience(experience) {
    // remove : from experience
    experience = experience.replace(":", "");
    // normalize "- " and " -" and " - " to "-"
    experience = experience.replace(" - ", "-");
    experience = experience.replace("- ", "-");
    experience = experience.replace(" -", "-");
    // format experience from "0-1 Years Experience" to "0-1"
    if (experience.includes("-")) {
        minExperienceYears = experience.split("-")[0].split(" ").pop();
        maxExperienceYears = experience.split("-")[1].split(" ")[0];
    } else if (experience.includes("+")) {
        minExperienceYears = experience.split("+")[0].split(" ").pop();
        maxExperienceYears = "99";
    }
    else {
        // take any number from experience
        experience = experience.match(/\d+/g);
        minExperienceYears = experience[0];
        maxExperienceYears = experience[0];
    }
    return [parseInt(minExperienceYears), parseInt(maxExperienceYears)];
}

function normalizeRal(Ral) {
    // split by " - " and take the first and last element
    Ral = Ral.toLowerCase().replace("k", "");
    let MinRal = Ral.split("-")[0].trim().split(" ").pop().trim();
    let MaxRal = Ral.split("-")[1].trim().split(" ")[0];
    return [parseInt(MinRal) * 1000, parseInt(MaxRal) * 1000];
}

function processData(data) {
    let processedData = [];
    for (let i = 0; i < data.length; i++) {
        let element = data[i].element;
        let title = data[i].title;
        let posterFirm = data[i].posterFirm;
        let formatTime = data[i].formatTime;
        let ral = data[i].ral;
        let experience = data[i].experience;
        let techsNames = data[i].techsNames;
        let description = data[i].description;
        let emoji = data[i].emoji;
        // fill empty formatTime with "Full-time"
        if (formatTime == "") {
            formatTime = "Full-time";
        }
        // fill empty experience with "0-1 Years Experience"
        if (experience == "") {
            experience = "0-1 Years Experience";
        }
        // remove emojis from experience and title and ral
        experience = removeEmojisFromString(experience);
        title = removeEmojisFromString(title);
        ral = removeEmojisFromString(ral);

        // normalize experience
        [minExperienceYears, maxExperienceYears] = normalizeExperience(experience);
        // normalize ral
        [minRal, maxRal] = normalizeRal(ral);

        // remove
        processedData.push({
            element: element,
            emoji: emoji,
            title: title,
            posterFirm: posterFirm,
            formatTime: formatTime,
            minExperienceYears: minExperienceYears,
            maxExperienceYears: maxExperienceYears,
            minRal: minRal,
            maxRal: maxRal,
            techsNames: techsNames,
            description: description});
    }
    return processedData;
}

data = takeDataFromDiv();
data = processData(data);
addCustomSearchBar(data);

// intercept click event on /html/body/div/div[2]/div/div[2]/span/span/span[2]/button/span
button = document.evaluate("/html/body/div/div[2]/div/div[2]/span/span/span[2]/button/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
button.addEventListener("click", function() {
    // delete html inside /html/body/div/div[2]/div/div[2]/div[1]
    let div = document.evaluate("/html/body/div/div[2]/div/div[2]/div[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    div.innerHTML = "";
    // take data from dropdowns
    let titleDropdown = document.getElementById("titleInput");
    let posterFirmDropdown = document.getElementById("posterFirmInput");
    let formatTimeDropdown = document.getElementById("formatTimeInput");
    let ralDropdown = document.getElementById("ralInput");
    ral = parseInt(ralDropdown.value);
    let experienceDropdown = document.getElementById("experienceInput");
    experience = parseInt(experienceDropdown.value);
    let techsNamesDropdown = document.getElementById("techsNamesInput");

    // filter data
    searched_data = data.filter(x => {
        
        if (titleDropdown.value != "" && x.title != titleDropdown.value) {
            return false;
        } else if (posterFirmDropdown.value != "" && x.posterFirm != posterFirmDropdown.value) {
            return false;
        } else if (formatTimeDropdown.value != "" && x.formatTime != formatTimeDropdown.value) {
            return false;
        } else if (ralDropdown.value != "" && ((x.minRal > ral) || (x.maxRal < ral))) {
            return false;
        } else if (experienceDropdown.value != "" && ((x.minExperienceYears > experience) || (x.maxExperienceYears < experience))) {
            return false;
        } else if (techsNamesDropdown.value != "" && !x.techsNames.includes(techsNamesDropdown.value)) {
            return false;
        } else {
            return true;
        }
    }
    );
    // add data.element to div
    for (let i = 0; i < searched_data.length; i++) {
        let element = searched_data[i].element;
        div.appendChild(element);
    }
});