// импорт библиотек firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, child, get } from "firebase/database";
// подключение аутентификации через файрбейс
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// параметры подключения к базе данных через переменные окружения
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// инициализация подключения к файрбазу
const app = initializeApp(firebaseConfig);
// инициализация подкючения к реалтайм database (куда я загрузила САМА свои данные)
const realtime_database = getDatabase(app);
// создаёт ссылку на корень базы данных в Firebase Realtime Database, используя объект базы данных, который вы инициализировали ранее.
const dbRef = ref(realtime_database);
// добавление модуля авторизации
const auth = getAuth(app)

let productCalories = {};
let myCategories = {}; //изначально словарь пустой

//текущее потребление пользователя (добавить другие параметры)
let consumedCalories = 0.0;
let consumedProteins = 0.0;

let total = {
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0
}


get(child(dbRef, `/categories`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      myCategories = snapshot.val(); //значению myCategories присвивается текущее состояние словаря
      generateDivs(); //после запускается функция создания общего дива для всех блоков категорий
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });


//Создание динамических объектов

function generateDivs() { //функция для создания основного дива id=my_categories;
  const container = document.getElementById("my_categories"); //див my_categories прописан в HTML но пустой. Присаиваем этот див переменнойconst container;
  for (const [key, value] of Object.entries(myCategories)) { //Object.entries(myCategories) вход в "полученный словарь"
    // console.log(key, value);


    //создаем div контейнер
    const div_container = document.createElement("div");
    div_container.className = 'category product_image_style'
    div_container.style = `background-image: url("${value.img}")`//берем значение img в словаре value


    //создаем header
    const header = document.createElement('h2')
    header.textContent = key


    //создаем selector
    const selector = document.createElement('select')
    selector.className = 'select-where'
    selector.id = 'select|' + key
    selector.options.add(new Option('Выберите продукт', '0'))
    for (const [product_key, product_value] of Object.entries(value.products)) {
      console.log(product_value)
      selector.options.add(new Option(product_key, key + "|" + product_key))
      // (product_key, key + "|" + product_key) ---> (key + "|" + product_key - значение value) а (product_key, - то что написано между треугольными скобками)
    }
    //запускается при изменении
    selector.addEventListener('change', selectProductClickFromNastya)


    //создаем consumtion input
    const consumptionInput = document.createElement('input')
    consumptionInput.id = "input|" + key
    consumptionInput.value = 100
    consumptionInput.className = 'input-grams'
    //запускается при изменении
    consumptionInput.addEventListener('change', chageConsumptionNastya)


    //создаем nutritients
    const nutrition_info_div = document.createElement("div");
    nutrition_info_div.className = 'nutrition_info'
    nutrition_info_div.id = 'nutrition_info|' + key


    //создаем add button
    const add_button = document.createElement('button')
    add_button.textContent = 'добавить в отчет'
    add_button.id = 'add_button|' + key
    add_button.className = 'add-button'
    // add_button.addEventListener('click', addButtonEvent)
    add_button.addEventListener('click', addButtonEventFromNastya)


    //Добавляем все созданные элементы в div_container.appendChild(button)
    div_container.appendChild(header)
    div_container.appendChild(selector)
    div_container.appendChild(consumptionInput)
    div_container.appendChild(nutrition_info_div)
    div_container.appendChild(add_button)
    // div_container.appendChild(img)
    container.appendChild(div_container);
  }
}




//функция отвечающая за вебранную категорию и за выбранный продукт в селекторе, которая добавляет див с инфо о нутриентах
function selectProductClickFromNastya() {
  const category_name = this.value.split("|")[0]
  const product_name = this.value.split("|")[1]
  const nutritionInfo = document.getElementById('nutrition_info|' + category_name)
  if (this.value === "0") {
    nutritionInfo.innerHTML = "";
  } else {
    const nutrition = myCategories[category_name].products[product_name];
    nutritionInfo.innerHTML = `

            <p>Ккал: ${nutrition.calories}</p>
            <p>Белки: ${nutrition.proteins} г</p>
            <p>Жиры: ${nutrition.fats} г</p>
            <p>Углеводы: ${nutrition.carbs} г</p>
        `;
  }
  const updatedcategory = document.getElementById('input|' + category_name)
  updatedcategory.value = 100;
}




//функция отвечающая за изменение инпута (по умолчанию валью установлен 100) и пересчета нутриентов соответсвенно
function chageConsumptionNastya() {
  const newamount = this.value
  const category_name = this.id.split("|")[1]
  const currentselectedvalue = document.getElementById('select|' + category_name).value
  const product_name = currentselectedvalue.split("|")[1]
  const coeff = newamount / 100.0;
  const nutritionInfo = document.getElementById('nutrition_info|' + category_name)
  const nutrition = myCategories[category_name].products[product_name];
  nutritionInfo.innerHTML = `
            <p>Ккал: <br> ${(nutrition.calories * coeff).toFixed(2)}</p>
            <p>Белки: ${(nutrition.proteins * coeff).toFixed(2)} г</p>
            <p>Жиры: ${(nutrition.fats * coeff).toFixed(2)} г</p>
            <p>Углеводы: ${(nutrition.carbs * coeff).toFixed(2)} г</p>
        `;
}




function addButtonEventFromNastya() {
  const category_name = this.id.split("|")[1]

  const currentselectedvalue = document.getElementById('select|' + category_name).value
  const product_name = currentselectedvalue.split("|")[1]

  let report = document.getElementById('sum_calories')
  const consumptionInput = document.getElementById('input|' + category_name)
  const coeff = consumptionInput.value / 100
  const nutrition = myCategories[category_name].products[product_name];

  total.calories = total.calories + (nutrition.calories * coeff)
  total.proteins = total.proteins + (nutrition.proteins * coeff)
  total.fats = total.fats + (nutrition.fats * coeff)
  total.carbs = total.carbs + (nutrition.carbs * coeff)

  report.innerHTML = `
            <p>Ккал: ${(total.calories).toFixed(1)} ккал</p>
            <p>Белки: ${(total.proteins).toFixed(1)} г</p>
            <p>Жиры: ${(total.fats).toFixed(1)} г</p>
            <p>Углеводы: ${(total.carbs).toFixed(1)} г</p>
        `;
}






// расчет суточной нормы ккал
function calculateCalories() {
  const weight = document.getElementById('weight').value
  const height = document.getElementById('height').value
  const age = document.getElementById('age').value
  const activity = document.getElementById('activity').value

  if (!weight || !height || !age || !activity) {
    alert('Please fill in all fields');
    return;
  }
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  // Calorie needs calculation
  const calories = bmr * activity;
  document.getElementById('result').innerHTML = `Ваша ежедневная норма составляет: ${Math.round(calories)} calories`
  console.log(Math.round(calories));

}

const startCalculateCalories = document.getElementById('btn-count-calories');
startCalculateCalories.addEventListener('click', calculateCalories)


// Sign in with email and password
function SignIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user.uid) // Redirect to signed-in page
    })
    .catch((error) => {
      console.log(error.message);
    });
}



// Sign up with email and password
function SignUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up and signed in
      const user = userCredential.user;
      console.log(user.uid); // Redirect to signed-in page
    })
    .catch((error) => {
      console.log(error.message);
    });
}

//авторизация
const signInButton = document.getElementById('sigh-in')
signInButton.addEventListener('click', SignIn)

const signUpButton = document.getElementById('sigh-up')
signInButton.addEventListener('click', SignUp)


