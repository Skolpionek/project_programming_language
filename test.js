import assert from 'assert';
import { interprete } from './main.js';

let passed = 0;
let failed = 0;

const tests = [
   // 1. MATEMATYKA
   { name: "Dodawanie", code: "+(5, 10, 5)", expected: 20 },
   { name: "Odejmowanie", code: "-(20, 5)", expected: 15 },
   { name: "Mnożenie", code: "*(3, 4)", expected: 12 },
   { name: "Dzielenie", code: "/(100, 4)", expected: 25 },
   { name: "Kolejność / Zagnieżdżenie", code: "+(2, *(3, 4))", expected: 14 },
   
   // 2. LOGIKA I PORÓWNANIA
   { name: "Równość", code: "==(10, 10)", expected: true },
   { name: "Nierówność", code: "!=(10, 5)", expected: true },
   { name: "Większe niż", code: ">(10, 5)", expected: true },
   { name: "Mniejsze lub równe", code: "<=(5, 5)", expected: true },
   { name: "Bramka AND", code: "and(true, true)", expected: true },
   { name: "Bramka OR", code: "or(false, true)", expected: true },
   
   // 3. ZMIENNE I TYPOWANIE
   { name: "Deklaracja zmiennej (num)", code: "=(x:num, 10); x", expected: 10 },
   { name: "Aktualizacja zmiennej", code: "=(y:num, 5); =(y, 15); y", expected: 15 },
   { name: "Skróty arytmetyczne", code: "=(z:num, 1); ++(z); z", expected: 2 },
   { name: "Typ any (zmiana typu)", code: "=(a:any, 5); =(a, \"tekst\"); a", expected: "tekst" },
   
   // 4. PRZEPŁYW STEROWANIA (Control Flow)
   { name: "Instrukcja IF (Prawda)", code: "if(true, 100, 200)", expected: 100 },
   { name: "Instrukcja IF (Fałsz)", code: "if(false, 100, 200)", expected: 200 },
   { name: "Pętla WHILE", code: "=(i:num, 0); while(<(i, 5), ++(i)); i", expected: 5 },
   { name: "Pętla FOR (Izolacja Scope)", code: "for(=(i:num, 0); <(i, 3); ++(i); 1);", expected: false },
   
   // 5. FUNKCJE I DOMKNIĘCIA (Closures)
   { name: "Prosta funkcja", code: "=(dodaj, func(a, b, +(a,b))); dodaj(2, 2)", expected: 4 },
   { name: "Zasięg leksykalny (Closure)", code: `
      =(makeAdder, func(x, func(y, +(x,y))));
      =(add10, makeAdder(10));
      add10(5)
   `, expected: 15 },
   
   // 6. LISTY I OBIEKTY
   { name: "Tworzenie listy i pobieranie", code: "=(l:list, list(10, 20)); l.get(1)", expected: 20 },
   { name: "Dodawanie do listy", code: "=(l:list, list()); l.add(99); l.get(0)", expected: 99 },
   { name: "Właściwość len (długość)", code: "=(l:list, list(1, 2, 3)); l.len", expected: 3 },
   
   // 7. METODY PRYMITYWÓW
   { name: "Metoda stringa (upper)", code: "=(s:str, \"hej\"); s.upper()", expected: "HEJ" },
   { name: "Właściwość stringa (len)", code: "=(s:str, \"test\"); s.len", expected: 4 },
   { name: "Metoda liczby (isEven)", code: "=(n:num, 4); n.isEven()", expected: true }
];

tests.forEach(test => {
   try {
      let result = interprete(test.code);
      assert.deepStrictEqual(result, test.expected);
      
      console.log(`✅ ZALICZONE: ${test.name}`);
      passed++;
   } catch (error) {
      console.log(`❌ OBLANE: ${test.name}`);
      console.log(`   Oczekiwano: ${test.expected}`);
      console.log(`   Błąd: ${error.message}`);
      failed++;
   }
});

console.log("\n--- PODSUMOWANIE ---");
console.log(`Zaliczone: ${passed}`);
console.log(`Oblane: ${failed}`);

if (failed > 0) {
   process.exit(1); 
} else {
   console.log("Działa");
}