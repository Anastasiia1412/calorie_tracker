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

get(child(dbRef, `/products`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      productCalories = snapshot.val();
      myCategories = snapshot.val();
      generateDivs();
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
  for (const [key, value] of Object.entries(myCategories))
    console.log(key, value);

  //созщдаем div контейнер
  const div_container = document.createElement("div");
  div_container.className = 'div_container' + key

  //наполняем дим контейнер кнопкой
  const button = document.createElement("button");
  button.className = "button_" + key;
  button.textContent = "Продукт базы: " + key;
  button.addEventListener("click", function (btn) {
    console.log("Нажат продукт " + this.className);
  });
  //наполняем див конейтер изображением из базы даннызх
  const img = document.createElement("img");
  img.src = value['img']
  div_container.appendChild(button)
  div_container.appendChild(img)
  container.appendChild(div_container);
}
// generateDivs()
// document.addEventListener("DOMContentLoaded", function () {
//   generateDivs();
// });




