# `cyc` Language Documentation

Welcome to `cyc`! It is a functional, dynamically evaluated programming language originally inspired by the **Egg** language from Marijn Haverbeke's *Eloquent JavaScript*. It features a Lisp-like syntax (AST trees) combined with static typing upon variable declaration, and supports dot notation (object-oriented style) for native properties and methods.

In `cyc`, everything is an expression (even loops and code blocks return values), and statements rely on function calls in the format: `operator(argument1, argument2)`. Arguments can be separated interchangeably using `,` and `;`.

## 1. Data Types

When declaring new variables, you must specify their type using a colon `:`.
Available types are:

* `num` - numbers (e.g., `5`, `-10.5`)
* `str` - strings (e.g., `"Hello world"`)
* `bool` - booleans (`true`, `false`)
* `list` - list structures
* `func` - functions
* `any` - dynamic type (allows assigning any data type and changing it later)

## 2. Variables and Assignments

The language uses a universal `=` operator for both declaring and updating variables. The intelligent dispatcher decides on its own whether to create a new variable in the local scope or update an existing one.

```javascript
# Declaring a new variable 
=(age, 25);
=(age:num, 22);
=(name, "John");
=(name:str, "Kevin");
=(isReady:bool, true);
=(isReady, false);
Alternatively: 
define(age, 25);

# Updating an existing variable (WITHOUT providing the type)
=(age, 26);
Alternatively: 
set(age, 26);

# Arithmetic shortcuts (increment / decrement)
++(age);  # Increases by 1
--(age);  # Decreases by 1

```

## 3. Mathematical and Logical Operators

Operators in `cyc` can take any number of arguments. Comparison operators support chaining, and logical operators feature built-in short-circuit evaluation.

### Mathematics

| Syntax | Description | Example | Result |
| --- | --- | --- | --- |
| `+` | Addition | `+(2, 2, 2)` | `6` |
| `-` | Subtraction | `-(10, 5, 5)` | `0` |
| `*` | Multiplication | `*(3, 3, 3)` | `27` |
| `/` | Division | `/(100, 2, 2)` | `25` |
| `^` | Exponentiation | `^(2, 3, 2)` | `64` |

### Logic and Comparisons

| Syntax | Description | Example | Result |
| --- | --- | --- | --- |
| `==`, `!=` | Equality / Inequality | `==(5, 5)` | `true` |
| `<`, `<=`, `>`, `>=` | Relational operators (chaining) | `<(1, 5, 10)` | `true` |
| `and`, `or` | Logical AND / OR | `and(true, true)` | `true` |
| `nand`, `nor` | Negated AND / OR | `nand(true, true)` | `false` |
| `not` | Logical NOT (1 argument only) | `not(false)` | `true` |

## 4. Control Flow

### The `do` Block

Executes a sequence of instructions sequentially and returns the result of the last one. It is used to group code. Useful for executing multiple instructions in something like `if` statement

```javascript
do(
   print("Step 1"),
   print("Step 2"),
   +(2, 2)
)

```

### The `if` Statement

Takes 2 or 3 arguments: `if(condition, true_branch, [false_branch])`.

```javascript
if(<(age, 18),
   print("You are a minor"),
   print("You are an adult")
)

```

### The `while` Loop

Executes instructions as long as the condition evaluates to true.

```javascript
=(x:num, 0);
while(<(x, 5),
   do(
      print(x),
      ++(x)
   )
)

```

### The `for` Loop

Creates its own isolated lexical scope (the counter variable does not leak outside). The syntax is `for(initialization; condition; step; body)`.

```javascript
for(=(i:num, 0); <(i, 10); ++(i);
   print("Loop iteration: ", i)
)

```

## 5. Functions and Closures

In `cyc`, functions are first-class citizens. They are created using the `func` operator (where the last argument is the function body, and the preceding ones are parameters) and assigned to variables. They possess their own isolated scope.

```javascript
# Function definition
=(add, func(a, b, +(a, b)));

# Function call
print(add(5, 10)); # Outputs: 15

# Recursion is natively supported!
=(factorial, func(n,
   if(<=(n, 1),
      1,
      *(n, factorial(-(n, 1)))
   )
));

```

## 6. Lists and Data Structures

`cyc` supports multi-dimensional list structures and allows accessing their methods and properties using dot notation (`object.property`).

```javascript
# Creating a list
=(myList:list, list(1, 2, 3));

# Adding elements (add method)
myList.add(4, 5);

# Reading the length (len property)
print("List length: ", myList.len);

# Multi-dimensional lists
=(matrix:list, list(list(1, 2), list(3, 4)));

```

## 7. Primitive Methods and Properties

To maximize performance, primitives (like numbers and strings) are not boxed into heavy objects but are kept as raw values. However, `cyc` features a dynamic method registry, allowing you to use dot notation directly on them!

*Properties are called without parentheses, while methods require them.*

### String Properties

```javascript
=(text:str, "  cYC language  ");
=(empty:str, "");

# Basic manipulations
print(text.lower);         # "  cyc language  "
print(text.upper);         # "  CYC LANGUAGE  "
print(text.trim);          # "cYC language"
print(text.capitalize);    # "  cyc language  " (Note: respects leading spaces)
print(text.reverse);       # "  egaugnal CYc  "

# Queries
print(text.len);           # 16
print(empty.isEmpty);      # true

```

### Number Properties

```javascript
=(n:num, -5.8);
=(num2:num, 42);
=(bigNum:num, 1500);

# Mathematics & Rounding
print(n.abs);              # 5.8
print(n.round);            # -6
print(n.floor);            # -6
print(n.ceil);             # -5
print(n.sign);             # -1 (returns 1 for positive, 0 for zero)

# Type Queries
print(num2.isEven);        # true
print(num2.isOdd);         # false
print(n.isInt);            # false
print(num2.isInt);         # true

# Conversions & Formatting
print(num2.bin);           # "101010" (Binary)
print(num2.oct);           # "52"     (Octal)
print(num2.hex);           # "2a"     (Hexadecimal)
print(bigNum.sNotation);   # "1.5 * 10^3" (Scientific notation)

```

### Methods (Require Arguments)

Depending on your specific `cyc` configuration, strings and numbers also support argument-based methods. For example:

```javascript
=(word:str, "hello");
print(word.repeat(3));         # "hellohellohello"
print(word.replace("h", "j")); # "jello"

```

## 8. Modules and Imports

`cyc` supports splitting your codebase into multiple files. You can import external `.cyc` files using the `import` special form. Each imported file is evaluated in its own isolated scope, preventing global namespace pollution.

```javascript
# --- math.cyc ---
=(magicNumber:num, 42);
=(double, func(x, *(x, 2)));

# --- main.cyc ---
=(math, import("math.cyc"));

# Accessing imported variables and functions via dot notation
print(math.magicNumber);   # 42
print(math.double(10));    # 20

```

## 9. Input / Output

* **`print(arg1, arg2...)`** - Prints arguments to the console. List formatting is handled automatically. *(Fun fact: printing the number 67 triggers a system Easter Egg).*

---

## Installation

Clone the repository and enter the project folder, then run the following command in your terminal:

```bash
npm link

```

## Running Scripts

Assuming your file is named `script.cyc`, run the following in your terminal:

```bash
cyc script.cyc

```

*End of documentation.*
