// импорт библиотек firebase
console.log('hello world');
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, child, get } from "firebase/database";
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

let productCalories = {};

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

function selectProductClick() {
  console.log(productCalories[this.value]);
  const nutritionInfo = this.nextElementSibling;

  if (this.value === "0") {
    nutritionInfo.innerHTML = "";
  } else {
    const nutrition = productCalories[this.value];
    nutritionInfo.innerHTML = `
        <p>Калории: ${nutrition.calories} ккал</p>
        <p>Белки: ${nutrition.proteins} г</p>
        <p>Жиры: ${nutrition.fats} г</p>
        <p>Углеводы: ${nutrition.carbs} г</p>
    `;
  }

}


