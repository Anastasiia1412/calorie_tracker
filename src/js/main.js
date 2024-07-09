// импорт библиотек firebase
console.log('hello world');
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

const dbRef = ref(realtime_database);
// добавление модуля авторизации
const auth = getAuth(app)

let productCalories = {};
let myCategories = {};

//текущее потребление пользователя (добавить другие параметры)
let consumedCalories = 0.0;
let consumedProteins = 0.0;


get(child(dbRef, `/categories`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      myCategories = snapshot.val();
      generateDivs();
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });

get(child(dbRef, `/products`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      productCalories = snapshot.val();
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });

const listOfCategories = document.querySelectorAll('.select-where');
listOfCategories.forEach((category) => {
  category.addEventListener('change', selectProductClick)
})

//вспомогательная функция для определения выбранного продутка в определенной категории
function getSelectedItemPerCategory(category) {
  const tmp = document.getElementById('select|' + category).value
  const res = tmp.split("|")[1]
  return res
}

//Вспомогательная функция для определения выбранной категории на основе id  элемента
function getSelectedCategory(id) {
  return id.split("|")[1]
}

//вспомогательная функция для определения потребленных значений выбранного продукта на основе id элемента
function getConsumedValue(id) {
  return Number(document.getElementById('input|' + getSelectedCategory(id)).value)
}

//функция обновления информации о текущем продутке с учетом заданного потребления
function updateConsumedInfo(categoryName, productName) {
  console.log(categoryName)
  console.log(productName)
  let nutritionInfo = document.getElementById('nutrition_info|' + categoryName)
  const consumedInput = Number(document.getElementById('input|' + categoryName).value)
  if (productName === "0") {
    nutritionInfo.innerHTML = "";
  } else {
    const nutrition = myCategories[categoryName]['products'][productName];
    nutritionInfo.innerHTML = `
        <p>Ккал: <br> ${Math.round(nutrition.calories / 100 * consumedInput, 2)} ккал</p>
        <p>Белки: ${Math.round(nutrition.proteins / 100 * consumedInput, 2)} г</p>
        <p>Жиры: ${Math.round(nutrition.fats / 100 * consumedInput, 2)} г</p>
        <p>Углеводы: ${Math.round(nutrition.carbs / 100 * consumedInput, 2)} г</p>
    `;
  }
}

//обработчик изменения потребления пользователя
function chageConsumption() {
  const chozenCategory = getSelectedCategory(this.id)
  const chozenProduct = getSelectedItemPerCategory(chozenCategory)
  updateConsumedInfo(chozenCategory, chozenProduct)
}
//обработчик нажатия кнопки добавления текущего потребления соответствующей категории
function addButtonEvent() {
  const chozenCategory = getSelectedCategory(this.id)
  const chozenProduct = getSelectedItemPerCategory(chozenCategory)
  const consumed = getConsumedValue(this.id)
  if (chozenProduct != undefined) {
    console.log(consumed)
    console.log(chozenCategory)
    console.log(chozenProduct)
    const nutrition = myCategories[chozenCategory]['products'][chozenProduct];
    consumedCalories = consumedCalories + Number(nutrition.calories / 100 * consumed)
    consumedProteins = consumedProteins + Number(nutrition.proteins / 100 * consumed)
    const str = `calories = ${consumedCalories}; proteins = ${consumedProteins}.`
    console.log(str)
  }

}

function selectProductClickNew() {
  const chozenCategory = getSelectedCategory(this.id)
  const chozenProduct = getSelectedItemPerCategory(chozenCategory)

  updateConsumedInfo(chozenCategory, chozenProduct)
}
function selectProductClick() {
  console.log(productCalories[this.value]);
  const nutritionInfo = this.nextElementSibling;

  if (this.value === "0") {
    nutritionInfo.innerHTML = "";
  } else {
    const nutrition = productCalories[this.value];
    nutritionInfo.innerHTML = `
        <p>Ккал: <br> ${nutrition.calories} ккал</p>
        <p>Белки: ${nutrition.proteins} г</p>
        <p>Жиры: ${nutrition.fats} г</p>
        <p>Углеводы: ${nutrition.carbs} г</p>
    `;
  }
}

const startCalculateCalories = document.getElementById('btn-count-calories');
startCalculateCalories.addEventListener('click', calculateCalories)


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

//динамические объекты

function generateDivs() {
  const container = document.getElementById("my_categories");
  for (const [key, value] of Object.entries(myCategories)) {
    console.log(key, value);
    //созщдаем div контейнер
    const div_container = document.createElement("div");
    div_container.className = 'category product_image_style'
    div_container.style = 'background-image: url(\"' + value['img'] + '\")'

    //header
    const header = document.createElement('h2')
    header.textContent = key

    //selector
    const selector = document.createElement('select')
    selector.className = 'select-where'
    selector.id = 'select|' + key
    selector.options.add(new Option('Выберите продукт', '0'))
    for (const [product_key, product_value] of Object.entries(value.products)) {
      console.log(product_value)
      selector.options.add(new Option(product_key, key + "|" + product_key))
    }
    selector.addEventListener('change', selectProductClickNew)

    //consumtion input
    const consumptionInput = document.createElement('input')
    consumptionInput.id = "input|" + key
    consumptionInput.value = 100
    consumptionInput.addEventListener('change', chageConsumption)

    //nutritients
    const nutrition_info_div = document.createElement("div");
    nutrition_info_div.className = 'nutrition_info'
    nutrition_info_div.id = 'nutrition_info|' + key

    //add button
    const add_button = document.createElement('button')
    add_button.textContent = 'add'
    add_button.id = 'add_button|' + key
    add_button.addEventListener('click', addButtonEvent)




    // div_container.appendChild(button)
    div_container.appendChild(header)
    div_container.appendChild(selector)
    div_container.appendChild(consumptionInput)
    div_container.appendChild(nutrition_info_div)
    div_container.appendChild(add_button)
    // div_container.appendChild(img)
    container.appendChild(div_container);



    //   <div class="category veggies">
    //   <h2>Овощи</h2>
    //   <select class="select-where" required>
    //     <option value="0">Выберите продукт</option>
    //     <option value="broccoli">Брокколи</option>
    //     <option value="carrot">Морковь</option>
    //     <option value="pepper">Перец</option>
    //   </select>
    //   <div class="nutrition_info"></div>
    // </div>

  }



}
// generateDivs()
// document.addEventListener("DOMContentLoaded", function () {
//   generateDivs();
// });




