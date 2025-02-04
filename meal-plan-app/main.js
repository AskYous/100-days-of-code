window.onload = function(){

    // ** Global Variables
    const mealPlanData = JSON.parse(localStorage.getItem('mealPlanData')) || [];
    let mealsReferenceData = JSON.parse(localStorage.getItem('mealsReferenceData')) || [];
    const remindersData = JSON.parse(localStorage.getItem('remindersData')) || [];
    let settingsData = JSON.parse(localStorage.getItem('settingsData')) || {
        mealSeasons:[],
        mealTypes:[],
        darkMode: false
    };

    // Page Elements
    // Main Container & Section Heading
    const mainContainer = document.querySelector('.container');
    const sectionHeading = document.querySelector('#section-heading');
    // Section COntainer
    const homeContainer = document.querySelector('.home');

    // Application Sections Array
    const appSections = [
        {
            name: "Meal Plan",
            section: "meal-plan",
            container: "mealPlanContainer",
            loadContent: function(e){
                loadMealPlan(e);
            }
        },
        {
            name: "Meals Reference",
            section: "meals-reference",
            container: "mealsReferenceContainer",
            loadContent: function(section){
                loadMealsReference(section);
            }
        },
        {
            name: "Reminders",
            section: "reminders",
            container: "remindersContainer",
            loadContent: function(section){
                loadReminders(section);
            }
        },
        {
            name: "Settings",
            section: "settings",
            container: "settingsContainer",
            loadContent: function(section){
                loadSettings(section);
            }
        },
        {
            name: "Simple Meal Planning!",
            section: "home",
            container: "homeContainer",
            loadContent: function(){
                console.log('Well that\'s odd, this is just a console log.');
            }
        }
    ];

    // Days of the week
    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

// ** Build Functions

    // Load Home Screen (Main Page)
    function loadMainPage(){
        // Loop through app sections to create button to go to section
        appSections.forEach(option => {
            if(option.section != 'home'){
                // Create Button
                mealPlanButton = document.createElement('button');
                // Apply Classes
                mealPlanButton.classList.add('main-button');
                mealPlanButton.classList.add('transition');
                // Add Text Content
                mealPlanButton.textContent = option.name;
                // Add Data Attribute (Section)
                mealPlanButton.dataset.section = option.section;
                // Add Event Listener
                mealPlanButton.addEventListener('click', goToSection)
                // Append Button to Container
                homeContainer.appendChild(mealPlanButton);
            }
        });
    }

// ** Load Sections

    // Go to section function - hides all divs and loads "shows" the target div
    function goToSection(e){
        // Remove content when going to 'home' section
        if(e.target.dataset.section == 'home'){
            // Grab Parent Element
            const parent = e.target.parentElement;
            // Grab content wrapper 
            const wrapperToRemove = parent.querySelector('.content-wrapper');
            // Remove if already present
            if (wrapperToRemove === null) {}else{
                wrapperToRemove.remove();
            }
        }

        // Grab Section Object
        const sectionObj = getSectionObject(e);

        // Hide All "Section" divs
        const divs = mainContainer.querySelectorAll('div');
        divs.forEach(div => {
            div.classList.remove('show');
            div.style.zIndex = -10;
        })

        // Show selected "Section" div
        const section = document.querySelector(`.${e.target.dataset.section}`);
        // Delay screen load by 0.5s
        setTimeout(() => {
            section.classList.add('show');
            section.style.zIndex = 10;
        }, 500);

        // Load Section
        loadSection(sectionObj);

        // Load Section Content
        const sectionText = sectionObj.section;
        sectionObj.loadContent(e);
    }
    // Populate Section
    function loadSection(obj){
        // Get Section Container
        const container = mainContainer.querySelector(`.${obj.section}`);

        // Change Heading to Section Name
        sectionHeading.textContent = obj.name;

        // Generate Go Home Button (if not present and not loading home section)
        if(!container.querySelector('button.main-button') && obj.section != 'home'){
            // Generage Home Button
            let goHome = generateHomeButton();
            goHome.addEventListener('click', goToSection);
            container.appendChild(goHome);
        }else{}
    }

// ** Meal Plan Functions

    // Load Meal Plan
    function loadMealPlan(e){
        // Grab meal plan container
        const container = getSection(e);
        // Clear previous meal plan
        cleanSectionData(container);

        // Grab date from target button
        const date = e.target.dataset.firstDay;
        let passedDate;
        // Get Passed date (if present) or Make today
        if(date === undefined){
            passedDate = new Date();
        }
        else{
            passedDate = new Date(date);
        }
        // Set Time to 12am (reset)
        passedDate.timeStartOfDay();
        // Set First Day of week
        const firstDayOfWeek = getFirstDayOfWeek(passedDate);
        // Set to 12am (reset)
        firstDayOfWeek.timeStartOfDay();
        const firstDayOfWeekText = getDateText(firstDayOfWeek);
        // Set End of Week
        const lastDayOfWeek = getLastDayOfWeek(firstDayOfWeek);
        lastDayOfWeek.timeEndOfDay()
        // Week Array
        const currentWeek = getCurrentWeek(firstDayOfWeek);

        // Wrap Meal Plan
        const mealPlanWrapper = document.createElement('div');
        mealPlanWrapper.classList.add('content-wrapper');

        // Week of and Prev/Next Week Container
        const weekOfContainer = document.createElement('div');
        weekOfContainer.classList.add('week-of');

        // Add Previous Week Button
        const prevWeekBtn = document.createElement('button');
        // Previous Week Date
        const prevWeekDate = changeDate(firstDayOfWeek, -7);
        // Check if daylight savings occured
        checkDaylightSavings(prevWeekDate);
        prevWeekBtn.dataset.firstDay = `${prevWeekDate}`;
        prevWeekBtn.dataset.section = sectionText;
        prevWeekButtonText = document.createTextNode('Prev Week');
        prevWeekBtn.appendChild(prevWeekButtonText);
        prevWeekBtn.addEventListener('click', loadMealPlan);
        weekOfContainer.appendChild(prevWeekBtn);

        // Set "Week Of Heading"
        const weekOfHeading = document.createElement('h2');
        const weekOfHeadingText = document.createTextNode(`Week of: ${firstDayOfWeekText}`);
        weekOfHeading.appendChild(weekOfHeadingText);
        weekOfContainer.appendChild(weekOfHeading);

        // Add Next week button
        const nextWeekBtn = document.createElement('button');
        // Next Week Date
        const nextWeekDate = changeDate(firstDayOfWeek, 7);
        // Check if daylight savings occurred
        checkDaylightSavings(nextWeekDate);
        nextWeekBtn.dataset.firstDay = `${nextWeekDate}`;
        nextWeekBtn.dataset.section = sectionText;
        nextWeekButtonText = document.createTextNode('Next Week');
        nextWeekBtn.appendChild(nextWeekButtonText);
        nextWeekBtn.addEventListener('click', loadMealPlan);
        weekOfContainer.appendChild(nextWeekBtn);

        // Append to wrapper contaier
        mealPlanWrapper.appendChild(weekOfContainer);

        // Get Meal Plan Data for that week (using first day of week)
        const currentWeekMealPlanData = loadCurrentWeekMeals(firstDayOfWeek);

        // Create 'ul' of current week's meal plan data
        const planList = createCurrentWeekMealList(currentWeek, currentWeekMealPlanData);

        // Append children to containers
        mealPlanWrapper.appendChild(planList);
        container.appendChild(mealPlanWrapper);
    }
    // Load Current Weeks Meals
    function loadCurrentWeekMeals(firstDay){
        // Create Array for Weeks Meal Plan Data
        const weekArray = [];
        // Set last day of week for end of day
        const lastDay = changeDate(firstDay, 7);
        lastDay.timeEndOfDay();
        // Loop through meal plan data and check if meals are within the range
        mealPlanData.forEach(meal => {
            mealDate = new Date(meal.date);
            // Check if meal date is within the given week
            if (mealDate >= firstDay && mealDate <= lastDay) {
                // If so add to weekArray
                console.log('Meal Added!');
                weekArray.push(meal);
            }
        });
        return weekArray;
    }
    // Create 'ul' list of current weeks meals
    function createCurrentWeekMealList(week, meals){
        const planList = document.createElement('ul');
        week.forEach(day => {
            // Initiate Meal & Recipe Link
            let currentMeal = '';
            let mealLink = '';
            let mealSeason = '';
            let mealDate = '';
            // Loop through current weeks meals
            meals.forEach(meal => {
                // If meal date matches the week date then set meal data
                if (getDateText(new Date(meal.date)) == getDateText(day)) {
                    mealDate = meal.date;
                    currentMeal = meal.meal.name;
                    mealLink = meal.meal.link;
                    mealSeason = meal.meal.season;
                }
            })
            // Create 'li' to append to 'ul'
            const listItem = document.createElement('li');
            listItem.dataset.date = day;
            listItem.dataset.meal = currentMeal;
            // Create List Item Text
            const listItemText = document.createTextNode(`${days[day.getDay()]}: ${currentMeal}`);
            listItem.appendChild(listItemText);
            listItem.dataset.date
            // Add 'addMeal' or 'updateMeal' eventListener
            if (mealDate == '') {
                listItem.addEventListener('click', addMeal);
            } else {
                listItem.classList.add('meal-exists');
                listItem.addEventListener('click', addMeal);
            }
            planList.appendChild(listItem);
        })
        return planList;
    }
    // Add new meal
    function addMeal() {

        // Meal Filter Object
        let mealFilter = {
            type: '',
            season: ''
        };

        let newMealPlanItem = true;

        // Add new/existing meal
        let addType = '';

        // Check if adding or updating meal
        if (this.classList.contains('meal-exists')) {
            newMealPlanItem = false;
            // *** TODO: Look through function to see what needs to be set here for the modal (existing meal data, etc.)
            console.log('Update meal!')
            console.log(this)
        } else {
            newMealPlanItem = true;
            console.log('Add new meal!');
        }

        // Create 'Modal/Popup'
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const modal = document.createElement('div');
        modal.classList.add('modal')
        modal.classList.add(newMealPlanItem ? 'add-meal' : 'update-meal')
        // Modal Heading Text
        const modalHeading = document.createElement('h1');
        const modalDate = getDateText(new Date(this.dataset.date));
        const modalHeadingText = document.createTextNode(newMealPlanItem ? `Add Meal for ${modalDate}` : `Update Meal for ${modalDate}`);
        modalHeading.appendChild(modalHeadingText);
        modal.appendChild(modalHeading);

        // *** Add radio button to select 'create new meal' or 'select an existing meal'
        const addMealSelectionTypeContainer = document.createElement('div');
        addMealSelectionTypeContainer.classList.add(newMealPlanItem ? 'add-meal-options' : 'update-meal-options')
        // * New Meal option
        const newMealRadioContainer = document.createElement('div');
        // New Meal Label
        const newMealRadioLabel = document.createElement('label');
        const newMealRadioLabelText = document.createTextNode('Create New Meal');
        newMealRadioLabel.setAttribute('for', 'new-meal');
        newMealRadioLabel.appendChild(newMealRadioLabelText);
        // New Meal Radio Button
        const newMealRadioButton = document.createElement('input');
        newMealRadioButton.classList.add('add-meal-radio')
        newMealRadioButton.setAttribute('type', 'radio');
        newMealRadioButton.id = 'new-meal';
        newMealRadioButton.setAttribute('name', 'add-meal');
        newMealRadioButton.setAttribute('value', 'new');
        newMealRadioButton.addEventListener('change', (e) => {
            modalSectionToShow(e);
            addType = 'new-meal';
        })
        // Append Children to containers
        newMealRadioContainer.appendChild(newMealRadioLabel);
        newMealRadioContainer.appendChild(newMealRadioButton);
        addMealSelectionTypeContainer.appendChild(newMealRadioContainer);
        // * Existing Meal option
        const existingMealRadioContainer = document.createElement('div');
        // Existing Meal Label
        const existingMealRadioLabel = document.createElement('label');
        const existingMealRadioLabelText = document.createTextNode('Choose Existing Meal');
        existingMealRadioLabel.setAttribute('for', 'existing-meal');
        existingMealRadioLabel.appendChild(existingMealRadioLabelText);
        // Existing Meal Radio Button
        const existingMealRadioButton = document.createElement('input');
        existingMealRadioButton.classList.add('add-meal-radio')
        existingMealRadioButton.setAttribute('type', 'radio');
        existingMealRadioButton.id = 'existing-meal';
        existingMealRadioButton.setAttribute('name', 'add-meal');
        existingMealRadioButton.setAttribute('value', 'new');
        existingMealRadioButton.addEventListener('change', (e) => {
            modalSectionToShow(e);
            addType = 'existing-meal';
        });
        // Append Children to containers
        existingMealRadioContainer.appendChild(existingMealRadioLabel);
        existingMealRadioContainer.appendChild(existingMealRadioButton);
        addMealSelectionTypeContainer.appendChild(existingMealRadioContainer);
        modal.appendChild(addMealSelectionTypeContainer);

    // *** New Meal Options
        const newMealOptionsContainer = document.createElement('div');
        newMealOptionsContainer.classList.add('new-meal-options');
        newMealOptionsContainer.classList.add('options-section');
        const newMealOptionsHeading = document.createElement('p');
        const newMealOptionsHeadingText = document.createTextNode('Fill out "New Meal" options below:');
        newMealOptionsHeading.appendChild(newMealOptionsHeadingText);
        newMealOptionsContainer.appendChild(newMealOptionsHeading);

        // ** Input Fields & Labels

        // * Meal Name
        const newMealNameContainer = document.createElement('div');
        newMealNameContainer.classList.add('meal-name');
        // Label
        newMealNameLabel = document.createElement('label')
        newMealNameLabel.setAttribute('for', 'meal-name');
        newMealNameLabelText = document.createTextNode('Meal Name');
        newMealNameLabel.appendChild(newMealNameLabelText);
        newMealNameContainer.appendChild(newMealNameLabel);
        // Input
        newMealNameInput = document.createElement('input');
        newMealNameInput.setAttribute('type', 'text');
        newMealNameInput.setAttribute('name', 'meal-name');
        newMealNameContainer.appendChild(newMealNameInput);
        newMealOptionsContainer.appendChild(newMealNameContainer);

        // * Meal Type (Pasta, comfort, etc.)
        const newMealTypeContainer = document.createElement('div');
        newMealTypeContainer.classList.add('meal-type');
        // Label
        const newMealTypeLabel = document.createElement('label');
        newMealTypeLabel.setAttribute('for', 'meal-type');
        const newMealTypeLabelText = document.createTextNode('Meal Type');
        newMealTypeLabel.appendChild(newMealTypeLabelText);
        newMealTypeContainer.appendChild(newMealTypeLabel);
        // Select
        const mealTypeSelection = document.createElement('select');
        mealTypeSelection.setAttribute('name', 'season-selection');
        settingsData.mealTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            optionText = document.createTextNode(type);
            option.appendChild(optionText);
            mealTypeSelection.appendChild(option);
        });
        newMealTypeContainer.appendChild(mealTypeSelection);
        newMealOptionsContainer.appendChild(newMealTypeContainer)

        // * Meal Link (Recipe/Restaurant)
        const newMealLinkContainer = document.createElement('div');
        newMealLinkContainer.classList.add('meal-link');
        // Label
        newMealLinkLabel = document.createElement('label')
        newMealLinkLabel.setAttribute('for', 'meal-link');
        newMealLinkLabelText = document.createTextNode('Recipe/Restaurant Link');
        newMealLinkLabel.appendChild(newMealLinkLabelText);
        newMealLinkContainer.appendChild(newMealLinkLabel);
        // Input
        newMealLinkInput = document.createElement('input');
        newMealLinkInput.setAttribute('type', 'url');
        newMealLinkInput.setAttribute('name', 'meal-name');
        newMealLinkContainer.appendChild(newMealLinkInput);
        newMealOptionsContainer.appendChild(newMealLinkContainer);

        // * Meal Season Selection Container
        const seasonSelectionContainer = document.createElement('div');
        seasonSelectionContainer.classList.add('meal-season');
        // Label Element
        const seasonSelectionLabel = document.createElement('label');
        const seasonSelectionLabelText = document.createTextNode('Season Selection');
        seasonSelectionLabel.appendChild(seasonSelectionLabelText);
        seasonSelectionLabel.setAttribute('for', 'season-selection');
        seasonSelectionContainer.appendChild(seasonSelectionLabel);
        // Select Element
        const seasonSelection = document.createElement('select');
        seasonSelection.setAttribute('name', 'season-selection');
        settingsData.mealSeasons.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal;
            optionText = document.createTextNode(meal);
            option.appendChild(optionText);
            seasonSelection.appendChild(option);
        });
        seasonSelectionContainer.appendChild(seasonSelection);
        newMealOptionsContainer.appendChild(seasonSelectionContainer);
        modal.appendChild(newMealOptionsContainer);

    // *** Existng Meal Options
        const existingMealOptionsContainer = document.createElement('div');
        existingMealOptionsContainer.classList.add('existing-meal-options');
        existingMealOptionsContainer.classList.add('options-section');
        const existingMealOptionHeading = document.createElement('p');
        const existingMealOptionsContainerText = document.createTextNode('Use the "Type" and "Season" lists to filter your meal options.');
        existingMealOptionHeading.appendChild(existingMealOptionsContainerText)
        existingMealOptionsContainer.appendChild(existingMealOptionHeading);

        // ** Inputs Fields & Labels

        // * Meal Type Drop Down (filter)
        const existingMealTypeContainer = document.createElement('div');
        existingMealTypeContainer.classList.add('meal-type-filter');
        // Label
        const existingMealTypeSelectionLabel = document.createElement('label');
        const existingMealTypeSelectionLabelText = document.createTextNode('Meal Type Filter');
        existingMealTypeSelectionLabel.appendChild(existingMealTypeSelectionLabelText);
        existingMealTypeSelectionLabel.setAttribute('for', 'meal-type-filter');
        existingMealTypeContainer.appendChild(existingMealTypeSelectionLabel);
        // Select
        const existingMealTypeSelection = document.createElement('select');
        existingMealTypeSelection.setAttribute('name', 'type-selection');
        existingMealTypeSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter, '.modal-meal-list');
        });
        settingsData.mealTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            optionText = document.createTextNode(type);
            option.appendChild(optionText);
            existingMealTypeSelection.appendChild(option);
        });
        existingMealTypeContainer.appendChild(existingMealTypeSelection);
        existingMealOptionsContainer.appendChild(existingMealTypeContainer);
        // * Meal Season Drop Down (filter)
        const existingMealSeasonContainer = document.createElement('div');
        existingMealSeasonContainer.classList.add('meal-type-filter');
        // Label
        const existingMealSeasonSelectionLabel = document.createElement('label');
        const existingMealSeasonSelectionLabelText = document.createTextNode('Meal Season Filter');
        existingMealSeasonSelectionLabel.appendChild(existingMealSeasonSelectionLabelText);
        existingMealSeasonSelectionLabel.setAttribute('for', 'meal-type-filter');
        existingMealSeasonContainer.appendChild(existingMealSeasonSelectionLabel);
        // Select
        const existingMealSeasonSelection = document.createElement('select');
        existingMealSeasonSelection.setAttribute('name', 'season-selection');
        existingMealSeasonSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter, '.content-wrapper');
        });
        settingsData.mealSeasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            optionText = document.createTextNode(season);
            option.appendChild(optionText);
            existingMealSeasonSelection.appendChild(option);
        });
        existingMealSeasonContainer.appendChild(existingMealSeasonSelection);
        existingMealOptionsContainer.appendChild(existingMealSeasonContainer);
        // * Meal List Container
        const modalMealList = document.createElement('div');
        modalMealList.classList.add('modal-meal-list');
        existingMealOptionsContainer.appendChild(modalMealList);
        // Append Existing Meal Options to Modal
        modal.appendChild(existingMealOptionsContainer);

        // ** Modal Buttons
        const addMealBtnContainer = document.createElement('div');
        addMealBtnContainer.classList.add('modal-button-container')
        // * Add Meal Button
        const addMealBtn = document.createElement('button');
        const addMealBtnText = document.createTextNode('Add Meal');
        addMealBtn.appendChild(addMealBtnText);
        // Set data attributes for reloading meal plan
        addMealBtn.dataset.date = this.dataset.date;
        addMealBtn.dataset.section = 'meal-plan';
        // Add eventlistener for button click
        addMealBtn.addEventListener('click', (e) => {
            const date = this.dataset.date;

            // Check if 'new-meal' radio is selected
            if(addType == 'new-meal'){
                const meal = newMealObject(newMealNameInput.value, mealTypeSelection.value, newMealLinkInput.value, seasonSelection.value);
                if(meal){
                    newMealPlanItem ? addMealPlanData(date, meal) : updateMealPlanData(date, this.dataset.meal ,meal);
                    this.dataset.meal = meal;
                    loadMealPlan(e);
                    closeOverlayModal();
                }
            // Else check if 'existing-meal' radio is selected
            } else if(addType == 'existing-meal'){
                // Grab 'meal-selection-radio' radio buttons
                const radios = document.querySelectorAll('.meal-selection-radio');
                let selected = '';
                // Loop through radios and look for checked radio button
                radios.forEach(radio => radio.checked ? selected = radio.value : '');
                // Use selectd meal name to look for meals in 'mealsReferenceData'
                const mealObject = mealsReferenceData
                    .filter(meal => meal.name == selected);
                // Set 'meal' using returned value above
                const meal = {
                    name: mealObject[0].name,
                    type: mealObject[0].type,
                    link: mealObject[0].link,
                    season: mealObject[0].season
                }
                // If meal exists add meal plan, load meal plan, and remove overlay
                if(meal){
                    newMealPlanItem ? addMealPlanData(date, meal) : updateMealPlanData(date, this.dataset.meal, meal);
                    loadMealPlan(e);
                    closeOverlayModal();
                }
            }
        });
        // * Cancel Button
        const cancelAddMealBtn = document.createElement('button');
        const cancelAddMealBtnText = document.createTextNode('Cancel');
        cancelAddMealBtn.appendChild(cancelAddMealBtnText);
        cancelAddMealBtn.addEventListener('click', () => {
            closeOverlayModal();
        });
        addMealBtnContainer.appendChild(addMealBtn);
        addMealBtnContainer.appendChild(cancelAddMealBtn);
        modal.appendChild(addMealBtnContainer);
        overlay.appendChild(modal);
        overlay.classList.add('transition');
        document.body.appendChild(overlay);
        // Add Existing Meal Options
        showFilteredMeals(mealFilter, '.modal-meal-list');
        setTimeout(() => {
            const showOverlay = document.querySelector('.overlay');
            console.log(showOverlay)
            showOverlay.classList.add('show')
            }, 500)
    }
    // Add Meal Plan Data
    function addMealPlanData(date, meal) {
        const mealPlanObject = newMealPlanObject(date, meal);
        // console.log('Meal Plan Object:',mealPlanObject)
        mealPlanData.push(mealPlanObject);
        localStorage.setItem('mealPlanData', JSON.stringify(mealPlanData));
    }
    // Update Meal Plan Data
    function updateMealPlanData(date, oldMeal, newMeal) {
        console.log('Update meal!', date, oldMeal, newMeal)

        mealPlanData.forEach(meal => {
            console.log(meal)
            if(meal.date == date && meal.meal.name == oldMeal){
                // console.log('New Meal', newMeal)
                meal.meal = newMeal;
            }
        })

        mealPlanData.sort((a,b) => a > b ? true : false);
        localStorage.setItem('mealPlanData', JSON.stringify(mealPlanData))

        console.log(mealPlanData)

    }

//  ** Meal Reference Functions
    function loadMealsReference(e){
        // Meal Filter Object
        let mealFilter = {
            type: '',
            season: ''
        };

        // Grab meal plan container
        const container = getSection(e);
        // Clear previous meal plan
        cleanSectionData(container);

        // Wrap Meals Reference Data
        const mealsReferenceWrapper = document.createElement('div');
        mealsReferenceWrapper.classList.add('content-wrapper');

        // ** Meal Filters
        const mealsReferenceFilterContainer = document.createElement('div');
        mealsReferenceFilterContainer.classList.add('meals-ref-filter');
        // * Type Filter
        const mealsReferenceTypeFilterContainer = document.createElement('div');
        // Label
        const mealsReferenceTypeFilterLabel = document.createElement('label');
        const mealsReferenceTypeFilterLabelText = document.createTextNode('Filter Meals by "Type":');
        mealsReferenceTypeFilterLabel.appendChild(mealsReferenceTypeFilterLabelText);
        mealsReferenceTypeFilterContainer.appendChild(mealsReferenceTypeFilterLabel);
        // Select
        const mealsReferenceTypeSelection = document.createElement('select');
        mealsReferenceTypeSelection.setAttribute('name', 'type-selection');
        mealsReferenceTypeSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter, '.ref-meal-list');
        });
        const firstType = document.createElement('option');
        firstType.value = '';
        mealsReferenceTypeSelection.appendChild(firstType);
        settingsData.mealTypes.map(type => {
            const option = document.createElement('option');
            option.value = type;
            const optionText = document.createTextNode(type);
            option.appendChild(optionText);
            mealsReferenceTypeSelection.appendChild(option);
        });
        mealsReferenceTypeFilterContainer.appendChild(mealsReferenceTypeSelection);
        mealsReferenceWrapper.appendChild(mealsReferenceTypeFilterContainer);
        container.appendChild(mealsReferenceWrapper);

        // * Season Filter
        const mealsReferenceSeasonFilterContainer = document.createElement('div');
        // Label
        const mealsReferenceSeasonFilterLabel = document.createElement('label');
        const mealsReferenceSeasonFilterLabelText = document.createTextNode('Filter Meals by "Season":');
        mealsReferenceSeasonFilterLabel.appendChild(mealsReferenceSeasonFilterLabelText);
        mealsReferenceSeasonFilterContainer.appendChild(mealsReferenceSeasonFilterLabel);
        // Select
        const mealsReferenceSeasonSelection = document.createElement('select');
        mealsReferenceSeasonSelection
        mealsReferenceSeasonSelection.setAttribute('name', 'season-selection');
        mealsReferenceSeasonSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter, '.ref-meal-list');
        });
        const firstSeason = document.createElement('option');
        firstSeason.value = '';
        mealsReferenceSeasonSelection.appendChild(firstSeason);
        settingsData.mealSeasons.map(season => {
            const option = document.createElement('option');
            option.value = season;
            const optionText = document.createTextNode(season);
            option.appendChild(optionText);
            mealsReferenceSeasonSelection.appendChild(option);
        });
        mealsReferenceSeasonFilterContainer.appendChild(mealsReferenceSeasonSelection);

        // Append Filters to Wrapper
        mealsReferenceWrapper.appendChild(mealsReferenceSeasonFilterContainer);

        // Load Meals Reference Data
        const mealsReferenceListContainer = document.createElement('div');
        mealsReferenceListContainer.classList.add('ref-meal-list');
        mealsReferenceWrapper.appendChild(mealsReferenceListContainer);
        const mealsReferenceList = showFilteredMeals(mealFilter, '.ref-meal-list');

        // Reference Buttons
        const mealsReferenceButonContainer = document.createElement('div');
        mealsReferenceButonContainer.classList.add('meal-reference-buttons');
        // Add Meal Button
        const mealsReferenceAddButton = document.createElement('button');
        mealsReferenceAddButton.textContent = 'Add Meal';
        mealsReferenceAddButton.dataset.section = 'meals-reference';
        mealsReferenceAddButton.dataset.type = 'add-meal';
        mealsReferenceAddButton.addEventListener('click', (e)=>{
            let selected = '';
            mealReferenceAddEditMealDialog(selected, e);
        })
        mealsReferenceButonContainer.appendChild(mealsReferenceAddButton);
        // Edit Meal Button
        const mealsReferenceEditButton = document.createElement('button');
        mealsReferenceEditButton.dataset.section = 'meals-reference';
        mealsReferenceEditButton.dataset.type = 'edit-meal';
        mealsReferenceEditButton.textContent = 'Edit Meal';
        mealsReferenceEditButton.addEventListener('click', (e) => {
            const radios = document.querySelectorAll('.meal-selection-radio');
            let selected = '';
            radios.forEach(radio => radio.checked ? selected = radio.value : '');
            selected != '' ? mealReferenceAddEditMealDialog(selected, e) : console.log('Nothing is selected');
        })
        mealsReferenceButonContainer.appendChild(mealsReferenceEditButton);
        // Delete Meal Button
        const mealsReferenceDeleteButton = document.createElement('button');
        mealsReferenceDeleteButton.textContent = 'Delete Meal';
        mealsReferenceDeleteButton.addEventListener('click', () => {
            const radios = document.querySelectorAll('.meal-selection-radio');
            let selected = '';
            radios.forEach(radio => radio.checked ? selected = radio.value : '');
            selected != '' ? mealReferenceDeletedDialog(selected, e) : '';
        })
        mealsReferenceButonContainer.appendChild(mealsReferenceDeleteButton)
        // Clear Radio Selections
        const mealsReferenceClearButton = document.createElement('button');
        mealsReferenceClearButton.textContent = 'Clear Selection';
        mealsReferenceClearButton.addEventListener('click', () => {
            const radios = document.querySelectorAll('.meal-selection-radio');
            radios.forEach(radio => radio.checked ? radio.checked = false : '');
        })
        mealsReferenceButonContainer.appendChild(mealsReferenceClearButton)

        mealsReferenceWrapper.appendChild(mealsReferenceButonContainer);

        // Append Wrapper to Container
        container.appendChild(mealsReferenceWrapper);
    }
    // Meal Reference Add/Edit Logic
    function mealReferenceAddEditMealDialog(selection,e) {
        console.log(e)
        // Add or Edit
        const entryType = e.target.dataset.type;
        console.log(entryType);
        // Grab 'meals-reference' div
        container = document.querySelector('.meals-reference');
        // Meal Object
        let originalMealObject;
        let newMealObject;

        // If Editing an existing meal
        if(entryType == 'edit-meal'){
            mealsReferenceData.forEach(meal => {
                meal.name == selection ? originalMealObject = meal : '';
            });
        }else{
            originalMealObject = {
                name: '',
                type: '',
                link: '',
                season: ''
            }
        }

        // *** Popup Creation
        // Overlay
        const editMealOverlay = document.createElement('div');
        editMealOverlay.classList.add('overlay');
        // Modal
        const editMealModal = document.createElement('div');
        editMealModal.classList.add('modal');

        // ** Heading
        const editMealModalHeading = document.createElement('h2');
        const editMealModalHeadingText = entryType == 'edit-meal' ? document.createTextNode(`Editing Meal: ${originalMealObject.name}`) : document.createTextNode(`Adding New Meal`);
        editMealModalHeading.appendChild(editMealModalHeadingText);
        editMealModal.appendChild(editMealModalHeading);

        // ** Labels & Inputs
        // * Meal Name - Text
        const editMealModalNameContainer = document.createElement('div');
        // Label
        const editMealModalNameLabel = document.createElement('label');
        const editMealModalNameLabelText = document.createTextNode('Meal Name: ');
        editMealModalNameLabel.appendChild(editMealModalNameLabelText);
        editMealModalNameContainer.appendChild(editMealModalNameLabel);
        // Text Input
        const editMealModalNameInput = document.createElement('input');
        editMealModalNameInput.setAttribute('type', 'text');
        editMealModalNameInput.value = originalMealObject.name;
        editMealModalNameContainer.appendChild(editMealModalNameInput);
        // Append name container to main container
        editMealModal.appendChild(editMealModalNameContainer);

        // * Meal Type - Select
        const editMealModalTypeContainer = document.createElement('div');
        // Label
        const editMealModalTypeLabel = document.createElement('label');
        const editMealModalTypeLabelText = document.createTextNode('Meal Type: ');
        editMealModalTypeLabel.appendChild(editMealModalTypeLabelText);
        editMealModalTypeContainer.appendChild(editMealModalTypeLabel);
        const editMealModalTypeSelect = document.createElement('select');
        // Select Input
        settingsData.mealTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            const optionText = document.createTextNode(type);
            option.appendChild(optionText);
            editMealModalTypeSelect.appendChild(option)
        })
        // Set select input to original meal's type
        for (let i = 0; i < editMealModalTypeSelect.options.length; i++){
            editMealModalTypeSelect.options[i].value == originalMealObject.type ? editMealModalTypeSelect.selectedIndex = i : '';
        }
        editMealModalTypeContainer.appendChild(editMealModalTypeSelect);
        editMealModal.appendChild(editMealModalTypeContainer);

        // * Meal Link - URL
        const editMealModalLinkContainer = document.createElement('div');
        // Label
        const editMealModalLinkLabel = document.createElement('label');
        const editMealModalLinkLabelText = document.createTextNode('Meal Link: ');
        editMealModalLinkLabel.appendChild(editMealModalLinkLabelText);
        editMealModalLinkContainer.appendChild(editMealModalLinkLabel);
        // Text Input
        const editMealModalLinkInput = document.createElement('input');
        editMealModalLinkInput.setAttribute('type', 'url');
        editMealModalLinkInput.value = originalMealObject.link;
        editMealModalLinkContainer.appendChild(editMealModalLinkInput);
        // Append name container to main container
        editMealModal.appendChild(editMealModalLinkContainer);

        // * Meal Season - Select
        const editMealModalSeasonContainer = document.createElement('div');
        // Label
        const editMealModalSeasonLabel = document.createElement('label');
        const editMealModalSeasonLabelText = document.createTextNode('Meal Season: ');
        editMealModalSeasonLabel.appendChild(editMealModalSeasonLabelText);
        editMealModalSeasonContainer.appendChild(editMealModalSeasonLabel);
        const editMealModalSeasonSelect = document.createElement('select');
        // Select Input
        settingsData.mealSeasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            const optionText = document.createTextNode(season);
            option.appendChild(optionText);
            editMealModalSeasonSelect.appendChild(option)
        })
        // Set select input to original meal's type
        for (let i = 0; i < editMealModalSeasonSelect.options.length; i++) {
           editMealModalSeasonSelect.options[i].value == originalMealObject.season ? editMealModalSeasonSelect.selectedIndex = i : '';
        }
        editMealModalSeasonContainer.appendChild(editMealModalSeasonSelect);
        editMealModal.appendChild(editMealModalSeasonContainer);

        // Finish & Cancel Buttons
        const editMealModalButtonContainer = document.createElement('div');
        const editMealModalFinishButton = document.createElement('button');
        editMealModalFinishButton.textContent = 'Finish';
        editMealModalFinishButton.addEventListener('click', () => {
            // Grag input field entries
            const mealName = editMealModalNameInput.value;
            const mealType = editMealModalTypeSelect.value;
            const mealLink = editMealModalLinkInput.value;
            const mealSeason = editMealModalSeasonSelect.value
            
            // Create new meal object
            newMealObject = {
                name: mealName,
                type: mealType,
                link: mealLink,
                season: mealSeason
            }
            
            // If Editing Exisiting Meal
            if (entryType == 'edit-meal') {
                mealsReferenceData.forEach(meal => {
                    if(originalMealObject.name == meal.name){
                        meal.name = mealName;
                        meal.type = mealType;
                        meal.link = mealLink;
                        meal.season = mealSeason;
                    };
                })
            }

            // If adding a new meal
            if(entryType == 'add-meal'){
                mealsReferenceData.push(newMealObject);
            }

            // Set local storage to updated dataset
            localStorage.setItem('mealsReferenceData', JSON.stringify(mealsReferenceData));
            
            // Close Overlay/Modal
            document.querySelector('.overlay').remove();

            // Reload Meals Reference Section
            loadMealsReference(e)
        })
        editMealModalButtonContainer.appendChild(editMealModalFinishButton);
        const editMealModalCancelButton = document  .createElement('button');
        editMealModalCancelButton.textContent = 'Cancel';
        editMealModalCancelButton.addEventListener('click', () => {
            document.querySelector('.overlay').remove();
        });
        // 
        editMealModalButtonContainer.appendChild(editMealModalCancelButton);
        editMealModal.appendChild(editMealModalButtonContainer);

        // Append Modal to Overlay
        editMealOverlay.appendChild(editMealModal);
        editMealOverlay.classList.add('show')
        // Append Overlay to Container
        document.body.appendChild(editMealOverlay);

    }
    // Meal Reference Delete Logic
    function mealReferenceDeletedDialog(selection, e){
        // Deleted Selected Item if no 'future' meal plan items have the meal in it
        // Todays Date
        const today = new Date();
        today.timeStartOfDay();
        // Meal Flag
        let activeMeal = false;
        // 
        mealPlanData.forEach(meal => {
            // Meals Date
            const mealDate = new Date(meal.date)
            // If meal is today or later
            if (mealDate >= today) {
                // If meal is in meal plan in future cannot be removed
                if(meal.meal.name == selection){
                    activeMeal = true;
                    console.log(`Meal: ${selection} is attached to a future meal and cannot be removed!`)
                }
            }
        });
        if(!activeMeal){
            mealsReferenceData = mealsReferenceData.filter(meal => meal.name !== selection);
            localStorage.setItem('mealsReferenceData', JSON.stringify(mealsReferenceData));
            // Load dialog/alert prompting user to confirm the removal
        }    
        loadMealsReference(e);
    }

    // ** Meal & Meal Plan Helper Functions
    // New Meal Plan Object
    function newMealPlanObject(date, meal) {
        const newMealPlanObject = {
            date: date,
            meal: meal
        }
        return newMealPlanObject;
    }
    // New Meal Object
    function newMealObject(meal, type, link, season) {
        // console.log('Attempting to create new meal!', mealsReferenceData);
        // Meal Exists flag (if a meal with the same name is already in the database)
        let mealExists = false;

        // Create new meal object
        const mealObject = {
            name: meal,
            type: type,
            link: link,
            season: season
        }

        // Check the mealsReferenceData array for another meal with the same name
        mealsReferenceData.forEach(ref => {
            console.log(mealObject.name, ref.name)
            if(mealObject.name == ref.name) {
                // If meal names match then set mealExists to true
                mealExists = true;
            }
        })

        // If meal is not already in the database then add it and return mealObject
        if(!mealExists) {
            mealsReferenceData.push(mealObject);
            localStorage.setItem('mealsReferenceData', JSON.stringify(mealsReferenceData));
            return mealObject;
        }else{
            // If meal exists return false and alert user.
            alert('Meal name already exists. Please choose a different name.');
            return false;
        }
        
    }
    // Set Meal Filters
    function setMealFilters(e, object) {
        const filterType = e.target.name;
        const filteredItem = e.target.options[e.target.selectedIndex].value;
        // Filter Logic (use object )
        if (filterType == 'season-selection') {
            object.season = filteredItem;
        } else {
            object.type = filteredItem;
        }
        return object;
    }
    // Show Filtered Meal List
    function showFilteredMeals(object, parent) {
        // Grab Parent Container
        const container = document.querySelector(`${parent}`);
        // Grab existing filtered list if present
        const listToClose = document.querySelector('.filtered-meal-list');
        if (listToClose != undefined) {
            listToClose.remove();
        }
        // Create 'ul' to list meals
        const mealList = document.createElement('ul');
        mealList.classList.add('filtered-meal-list');

        // Filter Meals
        let filteredMeals = mealsReferenceData
            .filter(meal => meal.type == object.type || object.type == '')
            .filter(meal => meal.season == object.season || object.season == '');

        // Create 'li' elements for filtered list and append to 'ul'
        filteredMeals.forEach(meal => {
            const listItem = document.createElement('li');
            const listItemRadio = document.createElement('input');
            listItemRadio.classList.add('meal-selection-radio')
            listItemRadio.setAttribute('type', 'radio');
            listItemRadio.setAttribute('name', 'meal-selection-radio');
            listItemRadio.setAttribute('value', meal.name);
            listItem.appendChild(listItemRadio);
            const listItemText = document.createTextNode(meal.name);
            listItem.appendChild(listItemText);
            mealList.appendChild(listItem);
        })

        // Append 'ul' to container
        container.appendChild(mealList);
    }

// ** Settings Functions
    function loadSettings(e){
        // Grab meal plan container
        const container = getSection(e);
        // Clear previous meal plan
        cleanSectionData(container);

        // Flags
        const flags = {
            type: 'false',
            season: 'false'
        }

        // Wrap Settings Data
        const settingsWrapper = document.createElement('div');
        settingsWrapper.classList.add('content-wrapper');

        // ** Type Selection List
        // Container
        const typeSelectionDataContainer = document.createElement('div');
        typeSelectionDataContainer.classList.add('settings-data-container')
        // * Label & Input (Enter New Type)
        const newTypeSelectionContainer = document.createElement('div');
        // Label
        const newTypeSelectionLabel = document.createElement('label');
        newTypeSelectionLabel.textContent = 'Enter a "New" meal type:';
        newTypeSelectionContainer.appendChild(newTypeSelectionLabel);
        // Input
        const newTypeSelectionInput = document.createElement('input');
        newTypeSelectionInput.setAttribute('type', 'text');
        newTypeSelectionInput.classList.add('new-type-selection-input');
        newTypeSelectionInput.addEventListener('click', (e) => {
            flags.type = true;
            flags.season = false;
            expandSettingsSection(flags);
        });
        newTypeSelectionContainer.appendChild(newTypeSelectionInput);
        // * Button
        const newTypeSelectionAddButton = document.createElement('button');
        newTypeSelectionAddButton.textContent = 'Add Type';
        newTypeSelectionAddButton.addEventListener('click', () => {
            const newTypeValue = document.querySelector('.new-type-selection-input').value;
            addMealType(newTypeValue);
        })
        newTypeSelectionContainer.appendChild(newTypeSelectionAddButton);
        // Append type selection container to wrapper
        typeSelectionDataContainer.appendChild(newTypeSelectionContainer);
        // * Type List
        const typeSelectionList = document.createElement('div');
        typeSelectionList.classList.add('type-selection-list');
        typeSelectionList.classList.add('transition');
        // Append Meal Type List container to wrapper
        typeSelectionDataContainer.appendChild(typeSelectionList);
        settingsWrapper.appendChild(typeSelectionDataContainer);

        // ** Meal Seasons List
        // Container
        const seasonSelectionDataContainer = document.createElement('div');
        seasonSelectionDataContainer.classList.add('settings-data-container')
        // * Label & Input
        const newSeasonSelectionContainer = document.createElement('div');
        // Label
        const newSeasonSelectionLabel = document.createElement('label');
        newSeasonSelectionLabel.textContent = 'Enter a "New" meal season:';
        newSeasonSelectionContainer.appendChild(newSeasonSelectionLabel);
        // Input
        const newSeasonSelectionInput = document.createElement('input');
        newSeasonSelectionInput.setAttribute('type', 'text');
        newSeasonSelectionInput.classList.add('new-season-selection-input');
        newSeasonSelectionInput.addEventListener('click', (e) => {
            flags.type = false;
            flags.season = true;
            expandSettingsSection(flags);
        });
        newSeasonSelectionContainer.appendChild(newSeasonSelectionInput);
        // * Button
        const newSeasonSelectionAddButton = document.createElement('button');
        newSeasonSelectionAddButton.textContent = 'Add Season';
        newSeasonSelectionAddButton.addEventListener('click', () => {
            const newSeasonValue = document.querySelector('.new-season-selection-input').value;
            addMealSeason(newSeasonValue);
        })
        newSeasonSelectionContainer.appendChild(newSeasonSelectionAddButton);
        // Season List
        const seasonSelectionList = document.createElement('div');
        seasonSelectionList.classList.add('season-selection-list');
        seasonSelectionList.classList.add('transition');
        // Append type selection container to wrapper
        seasonSelectionDataContainer.appendChild(newSeasonSelectionContainer)
        // Append Meal Season List container to wrapper
        seasonSelectionDataContainer.appendChild(seasonSelectionList);
        settingsWrapper.appendChild(seasonSelectionDataContainer);

        // ** Dark Mode
        const darkModeContainer = document.createElement('div');
        darkModeContainer.classList.add('dark-mode-container');
        // * Label & Input
        const darkModeLabelSpan = document.createElement('span');
        darkModeLabelSpan.classList.add('dark-mode-text');
        darkModeLabelSpan.textContent = 'Dark Mode';
        darkModeContainer.appendChild(darkModeLabelSpan);
        // Label
        const darkModeLabel = document.createElement('label');
        darkModeLabel.classList.add('toggle');
        darkModeLabel.setAttribute('for', 'dark-mode-check')
        const darkModeSwitch = document.createElement('span');
        darkModeSwitch.classList.add('toggle-switch');
        darkModeSwitch.classList.add('transition');
        settingsData.darkMode ? darkModeSwitch.classList.add('on') : darkModeSwitch.classList.remove('on');
        darkModeLabel.appendChild(darkModeSwitch);
        darkModeContainer.appendChild(darkModeLabel);
        // Input
        const darkModeCheckbox = document.createElement('input');
        darkModeCheckbox.setAttribute('type', 'checkbox');
        darkModeCheckbox.setAttribute('id', 'dark-mode-check');
        darkModeCheckbox.addEventListener('click', () => {
            darkModeToggle();
        });
        darkModeContainer.appendChild(darkModeCheckbox);
        // Append Dark Mode Container to wrapper
        settingsWrapper.appendChild(darkModeContainer);

        // ** Download All Data

        // ** Clear All Data
        const clearDataContainer = document.createElement('div');
        // * Label & Input
        let clearDataLabel;

        // Append wrapper to main container
        container.appendChild(settingsWrapper);

        // 'ul' of meal types
        showMealTypesList();
        // 'ul' of meal seasons
        showMealSeasonsList();
        // Set Dark Mode Toggle
        darkModeEnabled();
    }
    // Settings Section Expand
    function expandSettingsSection(flags){
        const typeList = document.querySelector('.type-selection-list');
        const seasonList = document.querySelector('.season-selection-list');
        if(flags.type){
            typeList.classList.add('show');
        }else{
            typeList.classList.remove('show');
        }
        if(flags.season){
            seasonList.classList.add('show');
        }else{
            seasonList.classList.remove('show');
        }
    }
    // * Meal Type List Functions
    // Show Meal Types List
    function showMealTypesList(){
        // Container
        const container = document.querySelector('.type-selection-list');

        // Check if 'ul' already exists
        const listToClose = document.querySelector('#type-list-ul');
        if (listToClose != undefined) {
            listToClose.remove();
        }

        // 'ul' to hold items
        const typeList = document.createElement('ul');
        typeList.id = 'type-list-ul';
        // Meal Types Loop
        settingsData.mealTypes.forEach(type => {
            // Create 'li'
            const item = document.createElement('li');
            item.dataset.type = type;
            // Create 'a' w/text
            const anchor = document.createElement('a');
            anchor.textContent = type;
            item.appendChild(anchor);
            // Create Remove Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Remove Type';
            deleteBtn.addEventListener('click', () => {removeMealType(type)});
            item.appendChild(deleteBtn);
            typeList.appendChild(item)
        })
        // Append List
        container.appendChild(typeList);

        // Remove Prior button if present
        const typeButtonToRemove = document.querySelector('.type-minimize-btn');
        if (typeButtonToRemove != undefined) {
            typeButtonToRemove.remove();
        }
        
        // Minimize List Button
        const minimizeTypeListButton = document.createElement('button');
        minimizeTypeListButton.textContent = 'Minimize List'
        minimizeTypeListButton.classList.add('type-minimize-btn');
        minimizeTypeListButton.addEventListener('click', () => {
            const typeList = document.querySelector('.type-selection-list');
            typeList.classList.remove('show');
        })
        container.appendChild(minimizeTypeListButton)
    }
    // Add Meal Type
    function addMealType(value){
        let typeNotPresent = true;
        settingsData.mealTypes.forEach(type => type == value ? typeNotPresent = false : '')
        typeNotPresent ? settingsData.mealTypes.push(value) : console.log('Type already in list');
        localStorage.setItem('settingsData', JSON.stringify(settingsData));
        typeNotPresent ? document.querySelector('.new-type-selection-input').value = '' : '';
        showMealTypesList();
    }
    // Remove Meal Type
    function removeMealType(value){
        settingsData.mealTypes.forEach(type => type == value ? console.log(`Deleted ${value} from meal type list!`) : '')
        settingsData.mealTypes = settingsData.mealTypes.filter(type => type != value);
        localStorage.setItem('settingsData', JSON.stringify(settingsData));
        showMealTypesList();
    };
    // * Meal Seasons List Functions
    function showMealSeasonsList(){
        // Container
        const container = document.querySelector('.season-selection-list');
        // Check if 'ul' already exists
        const listToClose = document.querySelector('#season-list-ul');
        if (listToClose != undefined) {
            listToClose.remove();
        }
        // 'ul' to hold items
        const typeList = document.createElement('ul');
        typeList.id = 'season-list-ul';

        // Loop through meal seasons to add to list
        settingsData.mealSeasons.forEach(season => {
            // Create 'li'
            const item = document.createElement('li');
            item.dataset.season = season;
            // Create 'a' with text
            const anchor = document.createElement('a');
            anchor.textContent = season;
            item.appendChild(anchor)
            // Create Remove Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Remove Season';
            deleteBtn.addEventListener('click', () => {
                removeMealSeason(season)
            });
            item.appendChild(deleteBtn);
            typeList.appendChild(item)
        });

        // Append list to container
        container.appendChild(typeList);

        // Remove Prior button if present
        const seasonButtonToRemove = document.querySelector('.season-minimize-btn');
        if (seasonButtonToRemove != undefined) {
            seasonButtonToRemove.remove();
        }

        // Minimize List Button
        const minimizeSeasonListButton = document.createElement('button');
        minimizeSeasonListButton.textContent = 'Minimize List'
        minimizeSeasonListButton.classList.add('season-minimize-btn');
        minimizeSeasonListButton.addEventListener('click', () => {
            const typeList = document.querySelector('.season-selection-list');
            typeList.classList.remove('show');
        })
        container.appendChild(minimizeSeasonListButton)
    }
    // Add Meal Season
    function addMealSeason(value){
        let seasonNotPresent = true;
        settingsData.mealSeasons.forEach(season => season == value ? seasonNotPresent = false : '');
        seasonNotPresent ? settingsData.mealSeasons.push(value) : console.log('Season already in list');
        localStorage.setItem('settingsData', JSON.stringify(settingsData))
        seasonNotPresent ? document.querySelector('.new-season-selection-input').value = '' : '';
        showMealSeasonsList();
    }
    // Remove Meal Season
    function removeMealSeason(value){
        settingsData.mealSeasons.forEach(season => season == value ? console.log(`Deleted ${season} from meal seasons list!`) : '');
        settingsData.mealSeasons = settingsData.mealSeasons.filter(season => season != value);
        localStorage.setItem('settingsData', JSON.stringify(settingsData));
        showMealSeasonsList();
    }
    // * Dark Mode
    function darkModeToggle(){
        // Change Dark-Mode state
        settingsData.darkMode ? settingsData.darkMode = false : settingsData.darkMode = true;

        // Get Toggle Switch
        const toggleSwitch = document.querySelector('.toggle-switch');

        // Set Toggle Switch State & update dark-mode state
        if(settingsData.darkMode){
            document.body.classList.add('dark-mode');
            toggleSwitch.classList.add('on')
            console.log(`Dark Mode: ${settingsData.darkMode}`)
        }else{
            document.body.classList.remove('dark-mode');
            toggleSwitch.classList.remove('on')
            console.log(`Dark Mode: ${settingsData.darkMode}`)
        }

        // Save settingsData
        localStorage.setItem('settingsData', JSON.stringify(settingsData))
    }
    function darkModeEnabled(){
        // Set Toggle Switch State & update dark-mode state
        if (settingsData.darkMode) {
            document.body.classList.add('dark-mode');
            console.log(`Dark Mode: ${settingsData.darkMode}`)
        } else {
            document.body.classList.remove('dark-mode');
            console.log(`Dark Mode: ${settingsData.darkMode}`)
        }
    }
    // Clear All Data
    function clearAllData(){
        // Bring up confirmation (require text to be input: like 'DELETE');

        // If text entered matches confirm the delete

        // Clear all data from localStorage
    }
    // Download all Data
    function downloadAllData(){
        // Download data to a CSV? or HTML doc?
    }

    // ** Utility Functions **

    // Update App Heading
    function getSection(e){
        // Grab meal plan container
        const sectionObj = getSectionObject(e);
        sectionText = sectionObj.section;
        const container = mainContainer.querySelector(`.${sectionText}`);
        return container;
    }
    // Generate Home Button
    function generateHomeButton() {
        mealPlanButton = document.createElement('button');
        mealPlanButton.classList.add('main-button');
        mealPlanButton.classList.add('transition');
        mealPlanButton.textContent = 'Go Home';
        mealPlanButton.dataset.section = 'home';

        mealPlanButton.addEventListener('click', goToSection)

        return mealPlanButton;
    }
    // Grab Section Object
    function getSectionObject(e) {
        const index = appSections.map(opt => opt.section).indexOf(`${e.target.dataset.section}`);
        const obj = appSections[index];
        return obj;
    }
    // Remove prior section data and update text
    function cleanSectionData(container) {
        if (container.querySelector('.content-wrapper') != null) {
            container.querySelector('.content-wrapper').remove();
        }
    }
    // Modal Section To Show Function
    function modalSectionToShow(e) {
        // Remove 'show' class from children
        const container = document.querySelector('.modal');
        const children = container.querySelectorAll('.options-section');
        children.forEach((child) => {
            child.classList.remove('show')
        });
        // Select section to show
        const showSectionText = `.${e.target.id}-options`;
        const sectionToShow = document.querySelector(showSectionText);
        setTimeout(() => sectionToShow.classList.add('show'), 500);
    }
    // Close Overlay/Modal
    function closeOverlayModal() {
        const showOverlay = document.querySelector('.overlay');
        console.log(showOverlay)
        showOverlay.classList.remove('show')
        setTimeout(() => {
            showOverlay.remove()
        }, 500);
    }

    // ** Start Script
    function start() {
        console.clear();
        loadMainPage();
        darkModeEnabled();
    }
    start();
}