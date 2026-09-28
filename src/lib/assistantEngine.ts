export type AssistantContext = {
  history: { role: 'user' | 'assistant'; content: string }[];
};

export type AssistantResponse = {
  content: string;
  followup?: string;
};

type Intent = {
  id: string;
  weight: number;
  match: (input: string, lower: string) => boolean;
  handler: (input: string, ctx: AssistantContext) => AssistantResponse;
};

function getHistory(ctx: AssistantContext): { user: string; assistant: string } | null {
  const h = ctx.history;
  if (h.length < 2) return null;
  const lastUser = [...h].reverse().find((m) => m.role === 'user');
  const lastAssistant = [...h].reverse().find((m) => m.role === 'assistant');
  return lastUser && lastAssistant ? { user: lastUser.content, assistant: lastAssistant.content } : null;
}

function greetingResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const h = new Date().getHours();
  const tod = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  const nameMatch = input.match(/(?:i'?m|i am|my name is|this is)\s+([a-z]{2,20})/i);
  const name = nameMatch?.[1] ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : '';
  const prev = getHistory(ctx);
  if (prev) {
    return {
      content: `Hi again! Ready to pick up where we left off, or start something new?\n\nI can help you with:\n- Study plans and exam prep\n- Programming (Python, Java, C/C++, HTML, JavaScript)\n- AI/ML learning paths\n- Daily planning and productivity\n- BCA and college guidance\n- Project planning\n- Reflection and motivation\n\nWhat would you like to dive into?`,
    };
  }
  return {
    content: `Good ${tod}${name ? `, ${name}` : ''}! I'm your LifeOS assistant.\n\nI can help you with quite a few things:\n\n- **Study & exams** — study plans, revision schedules, exam prep timelines\n- **Programming** — Python, Java, C, C++, HTML, JavaScript, React — with code examples\n- **AI & ML** — learning paths, career guidance, concept explanations\n- **BCA & college** — course planning, project ideas, career paths\n- **Daily planning** — schedules, time blocking, productivity systems\n- **Tasks & to-do** — prioritization, organization, breakdown\n- **Reflection** — diary prompts, motivation, stress management\n\nWhat's on your mind?`,
    followup: `You can ask me things like "Explain Python functions", "Make me a study plan", or "How do I learn AI as a BCA student?"`,
  };
}

function pythonResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/function/.test(lower)) {
    return {
      content: `### Python Functions\n\nA function is a reusable block of code that does a specific task. You define it once and call it whenever you need it.\n\n### Defining and calling a function\n\n\`\`\`python\n# Define a function\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Call it\nprint(greet("Disha"))  # Hello, Disha!\n\`\`\`\n\n### Parameters and defaults\n\n\`\`\`python\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint(power(3))       # 9 (default exponent)\nprint(power(3, 4))    # 81\n\`\`\`\n\n### Key points\n\n1. **\`def\`** starts the definition, followed by the function name and parentheses\n2. **Indentation** (4 spaces) defines the function body — Python uses whitespace, not braces\n3. **\`return\`** sends a value back. Without it, the function returns \`None\`\n4. **Default parameters** let you skip arguments — they use the default if not provided\n5. **You can return multiple values** as a tuple:\n\n\`\`\`python\ndef min_max(numbers):\n    return min(numbers), max(numbers)\n\nlow, high = min_max([3, 1, 4, 1, 5])\nprint(low, high)  # 1 5\n\`\`\`\n\n### Common mistakes\n\n- Forgetting the colon \`:\` after the function signature\n- Wrong indentation — the body must be indented consistently\n- Using a mutable default like \`def add(x, lst=[])\` — the list is shared across calls. Use \`lst=None\` instead:\n\n\`\`\`python\ndef add(x, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(x)\n    return lst\n\`\`\``,
    };
  }

  if (/class|object|oop|inherit/.test(lower)) {
    return {
      content: `### Python Classes and OOP\n\nA class is a blueprint for creating objects. Objects bundle data (attributes) and behavior (methods) together.\n\n### Basic class\n\n\`\`\`python\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        return f"{self.name} says Woof!"\n\n# Create an object\nd = Dog("Rex", "Labrador")\nprint(d.bark())  # Rex says Woof!\n\`\`\`\n\n### Inheritance\n\n\`\`\`python\nclass GuideDog(Dog):\n    def __init__(self, name, breed, handler):\n        super().__init__(name, breed)\n        self.handler = handler\n\n    def guide(self):\n        return f"{self.name} is guiding {self.handler}"\n\ng = GuideDog("Buddy", "Golden", "Disha")\nprint(g.bark())   # Buddy says Woof! (inherited)\nprint(g.guide())  # Buddy is guiding Disha\n\`\`\`\n\n### Key concepts\n\n1. **\`__init__\`** is the constructor — runs when you create an object\n2. **\`self\`** refers to the current instance (like \`this\` in Java/JS)\n3. **Inheritance** lets a class reuse and extend another class\n4. **\`super()\`** calls the parent class's methods`,
    };
  }

  if (/list|dict|tuple|set|data structure/.test(lower)) {
    return {
      content: `### Python Data Structures\n\nPython has four built-in data structures you'll use constantly:\n\n### List — ordered, mutable\n\n\`\`\`python\nfruits = ["apple", "banana", "cherry"]\nfruits.append("date")\nfruits[0] = "apricot"\nprint(fruits)  # ['apricot', 'banana', 'cherry', 'date']\n\`\`\`\n\n### Dictionary — key-value pairs\n\n\`\`\`python\nstudent = {"name": "Disha", "age": 21, "course": "BCA"}\nprint(student["name"])    # Disha\nstudent["age"] = 22        # update\nstudent["grade"] = "A"     # add new key\n\`\`\`\n\n### Tuple — ordered, immutable\n\n\`\`\`python\npoint = (3, 4)\nx, y = point  # unpacking\n\`\`\`\n\n### Set — unordered, unique elements\n\n\`\`\`python\ntags = {"python", "code", "python"}  # {'python', 'code'}\ntags.add("java")\n\`\`\`\n\n### When to use which\n\n| Structure | Ordered | Mutable | Use when |\n|-----------|---------|---------|----------|\n| List | Yes | Yes | sequence of items |\n| Dict | No | Yes | key-value lookup |\n| Tuple | Yes | No | fixed grouping |\n| Set | No | Yes | unique items |`,
    };
  }

  if (/loop|for|while|iterate/.test(lower)) {
    return {
      content: `### Python Loops\n\n### For loop\n\n\`\`\`python\nfor i in range(5):\n    print(i)  # 0 1 2 3 4\n\nfor fruit in ["apple", "banana"]:\n    print(fruit)\n\`\`\`\n\n### While loop\n\n\`\`\`python\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1\n\`\`\`\n\n### List comprehension (Pythonic way)\n\n\`\`\`python\nsquares = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]\n\nevens = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]\n\`\`\`\n\n### break and continue\n\n\`\`\`python\nfor i in range(10):\n    if i == 5:\n        break       # stop the loop\n    if i % 2 == 0:\n        continue    # skip even numbers\n    print(i)  # 1 3\n\`\`\``,
    };
  }

  return {
    content: `### Python\n\nPython is a high-level, readable language used for scripting, data science, web backends, automation, and AI/ML.\n\n### Basic syntax\n\n\`\`\`python\n# Variables\nname = "Disha"\nage = 21\nis_active = True\n\n# Conditional\nif age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teen")\nelse:\n    print("Child")\n\n# Function\ndef square(x):\n    return x * x\n\nprint(square(5))  # 25\n\`\`\`\n\n### Key features\n\n- **Indentation** defines code blocks (4 spaces) — no braces like Java or C\n- **Dynamically typed** — you don't declare variable types\n- **Interpreted** — runs line by line, great for quick testing\n- **Huge standard library** — \`os\`, \`json\`, \`math\`, \`datetime\`, \`collections\`\n\n### Common gotchas\n\n- Indentation errors are the #1 beginner mistake\n- Mutable default arguments (\`def f(x, lst=[])\`) share state across calls\n- \`is\` checks identity, \`==\` checks equality — use \`==\` for values`,
    followup: `What specific Python topic would you like to explore — functions, classes, loops, data structures, or something else?`,
  };
}

function javaResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/class|object|oop|inherit/.test(lower)) {
    return {
      content: `### Java Classes and OOP\n\nJava is fully object-oriented — everything lives inside a class.\n\n### Basic class\n\n\`\`\`java\npublic class Student {\n    private String name;\n    private int age;\n\n    // Constructor\n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n\n    // Method\n    public String getInfo() {\n        return name + " is " + age + " years old";\n    }\n\n    public static void main(String[] args) {\n        Student s = new Student("Disha", 21);\n        System.out.println(s.getInfo());\n    }\n}\n\`\`\`\n\n### Inheritance\n\n\`\`\`java\nclass BCAStudent extends Student {\n    private String college;\n\n    public BCAStudent(String name, int age, String college) {\n        super(name, age);  // call parent constructor\n        this.college = college;\n    }\n\n    public String getCollege() {\n        return college;\n    }\n}\n\`\`\`\n\n### Key concepts\n\n1. **\`class\`** defines the blueprint, \`new\` creates an instance\n2. **\`this\`** refers to the current object\n3. **\`super\`** calls the parent class constructor or methods\n4. **\`private\`** restricts access — use getters/setters to read/write\n5. **\`static\`** means the member belongs to the class, not an instance`,
    };
  }

  if (/array|arraylist|collection|list/.test(lower)) {
    return {
      content: `### Java Arrays and ArrayLists\n\n### Array — fixed size\n\n\`\`\`java\nint[] nums = {1, 2, 3, 4, 5};\nfor (int i = 0; i < nums.length; i++) {\n    System.out.println(nums[i]);\n}\n\`\`\`\n\n### ArrayList — dynamic size\n\n\`\`\`java\nimport java.util.ArrayList;\n\nArrayList<String> names = new ArrayList<>();\nnames.add("Disha");\nnames.add("Sam");\nnames.add("Lee");\n\nSystem.out.println(names.get(0));  // Disha\nnames.remove(1);                    // removes "Sam"\nSystem.out.println(names.size());   // 2\n\nfor (String name : names) {\n    System.out.println(name);\n}\n\`\`\`\n\n### Array vs ArrayList\n\n| Feature | Array | ArrayList |\n|---------|-------|-----------|\n| Size | Fixed | Dynamic |\n| Syntax | \`int[]\` | \`ArrayList<Integer>\` |\n| Methods | None | add, remove, get, size |\n| Performance | Slightly faster | More flexible |\n\nUse arrays for fixed-size data, ArrayList when you need to add/remove elements dynamically.`,
    };
  }

  return {
    content: `### Java Basics\n\nJava is a compiled, object-oriented language. It's strongly typed and runs on the JVM (Write Once, Run Anywhere).\n\n### Hello World\n\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n\`\`\`\n\n### Variables and types\n\n\`\`\`java\nint age = 21;\ndouble pi = 3.14;\nboolean isActive = true;\nString name = "Disha";\nchar grade = 'A';\n\`\`\`\n\n### Conditional and loop\n\n\`\`\`java\nif (age >= 18) {\n    System.out.println("Adult");\n} else {\n    System.out.println("Minor");\n}\n\nfor (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\n\`\`\`\n\n### Key points\n\n1. Every statement ends with a semicolon \`;\`\n2. Code lives inside classes, statements live inside methods\n3. \`public static void main(String[] args)\` is the entry point\n4. Java is **strongly typed** — you must declare types (\`int\`, \`String\`, etc.)\n5. Use \`System.out.println()\` to print`,
    followup: `Want me to explain a specific Java concept — classes, inheritance, arrays, exceptions, or something else?`,
  };
}

function cResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/pointer/.test(lower)) {
    return {
      content: `### C Pointers\n\nA pointer is a variable that stores the **memory address** of another variable.\n\n### Basic example\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    int x = 42;\n    int *ptr = &x;  // ptr stores the address of x\n\n    printf("Value of x: %d\\n", x);       // 42\n    printf("Address of x: %p\\n", &x);     // 0x...\n    printf("ptr points to: %d\\n", *ptr);   // 42 (dereference)\n\n    *ptr = 100;  // change x through the pointer\n    printf("x is now: %d\\n", x);          // 100\n\n    return 0;\n}\n\`\`\`\n\n### Key operators\n\n- **\`&\`** (address-of): gives the memory address of a variable\n- **\`*\`** (dereference): accesses the value at the address\n\n### Why pointers matter\n\n1. **Pass by reference** — modify a variable inside a function\n2. **Dynamic memory** — \`malloc\`/\`free\` for runtime allocation\n3. **Arrays and strings** — arrays decay to pointers in C\n4. **Data structures** — linked lists, trees, etc. rely on pointers\n\n### Common mistakes\n\n- Forgetting to initialize a pointer → undefined behavior\n- Dereferencing a NULL pointer → crash\n- Memory leaks — forgetting \`free()\` after \`malloc()\``,
    };
  }

  if (/struct/.test(lower)) {
    return {
      content: `### C Structs\n\nA struct groups related variables of different types under one name.\n\n\`\`\`c\n#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    char name[50];\n    int age;\n    float gpa;\n};\n\nint main() {\n    struct Student s;\n    strcpy(s.name, "Disha");\n    s.age = 21;\n    s.gpa = 8.5;\n\n    printf("Name: %s\\n", s.name);\n    printf("Age: %d\\n", s.age);\n    printf("GPA: %.1f\\n", s.gpa);\n\n    return 0;\n}\n\`\`\`\n\n### Key points\n\n1. **\`struct\`** defines the layout; you create instances like any variable\n2. Access fields with the dot operator \`.\` (or \`->\` if using a pointer)\n3. C structs don't have methods — only data (unlike C++ classes)\n4. Useful for grouping related data: coordinates, student records, config settings`,
    };
  }

  return {
    content: `### C Programming\n\nC is a low-level, compiled language. It gives you direct control over memory and is the foundation for operating systems, embedded systems, and many other languages.\n\n### Hello World\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n\`\`\`\n\n### Variables and input\n\n\`\`\`c\nint age = 21;\nfloat pi = 3.14;\nchar grade = 'A';\n\nint num;\nprintf("Enter a number: ");\nscanf("%d", &num);\nprintf("You entered: %d\\n", num);\n\`\`\`\n\n### For loop\n\n\`\`\`c\nfor (int i = 0; i < 5; i++) {\n    printf("%d\\n", i);\n}\n\`\`\`\n\n### Key points\n\n1. Every C program starts at \`main()\`\n2. \`#include\` imports header files (like \`stdio.h\` for I/O)\n3. C is **statically typed** and **compiled** — no garbage collection\n4. You manage memory yourself with \`malloc\`/\`free\`\n5. Use \`printf\` for output, \`scanf\` for input`,
    followup: `Want me to explain a specific C topic — pointers, structs, memory management, or something else?`,
  };
}

function cppResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/class|object|oop|inherit/.test(lower)) {
    return {
      content: `### C++ Classes and OOP\n\nC++ extends C with object-oriented features: classes, inheritance, and polymorphism.\n\n### Basic class\n\n\`\`\`cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int age;\npublic:\n    Student(string n, int a) : name(n), age(a) {}\n\n    void display() {\n        cout << name << ", " << age << " years old" << endl;\n    }\n};\n\nint main() {\n    Student s("Disha", 21);\n    s.display();  // Disha, 21 years old\n    return 0;\n}\n\`\`\`\n\n### Inheritance\n\n\`\`\`cpp\nclass BCAStudent : public Student {\nprivate:\n    string college;\npublic:\n    BCAStudent(string n, int a, string c) : Student(n, a), college(c) {}\n\n    void showCollege() {\n        cout << "College: " << college << endl;\n    }\n};\n\`\`\`\n\n### Key concepts\n\n1. **\`public\`/\`private\`** control access to members\n2. **Constructor initializer list** (\`: name(n), age(a)\`) initializes members efficiently\n3. **\`public Student\`** means BCAStudent inherits publicly from Student\n4. C++ supports **multiple inheritance** (unlike Java)`,
    };
  }

  if (/stl|vector|template|generic/.test(lower)) {
    return {
      content: `### C++ STL (Standard Template Library)\n\nThe STL provides ready-to-use containers and algorithms.\n\n### Vector (dynamic array)\n\n\`\`\`cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1, 2, 3};\n    nums.push_back(4);\n\n    for (int n : nums) {\n        cout << n << " ";  // 1 2 3 4\n    }\n    cout << endl;\n    cout << "Size: " << nums.size() << endl;\n    return 0;\n}\n\`\`\`\n\n### Common STL containers\n\n| Container | Use |\n|-----------|-----|\n| \`vector\` | dynamic array |\n| \`map\` | key-value pairs |\n| \`set\` | unique elements |\n| \`stack\` | LIFO |\n| \`queue\` | FIFO |\n| \`string\` | text |\n\n### Algorithms\n\n\`\`\`cpp\n#include <algorithm>\n\nvector<int> v = {3, 1, 4, 1, 5};\nsort(v.begin(), v.end());  // 1 1 3 4 5\nint maxVal = *max_element(v.begin(), v.end());  // 5\n\`\`\``,
    };
  }

  return {
    content: `### C++ Programming\n\nC++ is a powerful language that combines C's low-level control with object-oriented features.\n\n### Hello World\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n\`\`\`\n\n### Variables and input\n\n\`\`\`cpp\nint age = 21;\ndouble pi = 3.14;\nstring name = "Disha";\n\ncout << "Enter age: ";\ncin >> age;\ncout << "You are " << age << " years old" << endl;\n\`\`\`\n\n### Key differences from C\n\n1. **\`cout\`/\`cin\`** instead of \`printf\`/\`scanf\` — type-safe I/O\n2. **Classes and objects** — full OOP support\n3. **STL** — vectors, maps, algorithms built in\n4. **References** (\`int& ref = x\`) — safer alternative to pointers\n5. **Namespaces** — avoid name collisions (\`using namespace std\`)\n\n### C vs C++ quick comparison\n\n| Feature | C | C++ |\n|---------|---|-----|\n| OOP | No | Yes |\n| I/O | printf/scanf | cout/cin |\n| STL | No | Yes |\n| References | No | Yes |\n| Overloading | No | Yes |`,
    followup: `Want me to explain a specific C++ topic — classes, STL, pointers, templates, or something else?`,
  };
}

function htmlResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/form|input|submit/.test(lower)) {
    return {
      content: `### HTML Forms\n\nForms collect user input and send it to a server.\n\n\`\`\`html\n<form action="/submit" method="POST">\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name" required>\n\n  <label for="email">Email:</label>\n  <input type="email" id="email" name="email" required>\n\n  <label for="course">Course:</label>\n  <select id="course" name="course">\n    <option value="bca">BCA</option>\n    <option value="mca">MCA</option>\n    <option value="btech">B.Tech</option>\n  </select>\n\n  <button type="submit">Submit</button>\n</form>\n\`\`\`\n\n### Key input types\n\n| Type | Use |\n|------|-----|\n| \`text\` | Single-line text |\n| \`email\` | Email with validation |\n| \`password\` | Hidden input |\n| \`number\` | Numeric input |\n| \`date\` | Date picker |\n| \`checkbox\` | Boolean toggle |\n| \`radio\` | One from a group |\n| \`file\` | File upload |\n\n### Important attributes\n\n- **\`required\`** — field must be filled before submit\n- **\`placeholder\`** — hint text inside the field\n- **\`name\`** — identifies the field when the form is sent\n- **\`action\`** — URL to send the data to\n- **\`method\`** — \`GET\` (URL) or \`POST\` (body)`,
    };
  }

  if (/table/.test(lower)) {
    return {
      content: `### HTML Tables\n\nTables display data in rows and columns.\n\n\`\`\`html\n<table>\n  <thead>\n    <tr>\n      <th>Subject</th>\n      <th>Marks</th>\n      <th>Grade</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Math</td>\n      <td>85</td>\n      <td>A</td>\n    </tr>\n    <tr>\n      <td>Programming</td>\n      <td>92</td>\n      <td>A+</td>\n    </tr>\n  </tbody>\n</table>\n\`\`\`\n\n### Structure\n\n- **\`<table>\`** — the container\n- **\`<thead>\`** / **\`<tbody>\`** — header and body sections\n- **\`<tr>\`** — table row\n- **\`<th>\`** — header cell (bold by default)\n- **\`<td>\`** — data cell\n\nUse tables for **tabular data only**, not for page layout — use CSS Grid or Flexbox for layout.`,
    };
  }

  return {
    content: `### HTML (HyperText Markup Language)\n\nHTML is the foundation of every web page. It describes the **structure** and **content** of a page using tags (elements).\n\n### Basic page structure\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is a paragraph.</p>\n  <a href="https://example.com">A link</a>\n  <img src="photo.jpg" alt="Description">\n</body>\n</html>\n\`\`\`\n\n### Common tags\n\n| Tag | Purpose |\n|-----|---------|\n| \`<h1>\`–\`<h6>\` | Headings (h1 = largest) |\n| \`<p>\` | Paragraph |\n| \`<a href="...">\` | Link |\n| \`<img src="...">\` | Image |\n| \`<ul>\` / \`<ol>\` / \`<li>\` | Lists |\n| \`<div>\` | Block container |\n| \`<span>\` | Inline container |\n| \`<table>\` | Table |\n| \`<form>\` | Form |\n\n### Key concepts\n\n1. **Tags come in pairs**: \`<p>...</p>\` — opening and closing\n2. **Attributes** go in the opening tag: \`<a href="url">\`, \`<img src="pic.jpg">\`\n3. **\`<head>\`** contains metadata (title, charset, CSS links) — not visible\n4. **\`<body>\`** contains everything the user sees\n5. **Semantic tags** (HTML5): \`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`, \`<article>\`, \`<section>\` — they describe meaning, not just layout\n\n### How HTML, CSS, and JavaScript work together\n\n- **HTML** = structure (the skeleton)\n- **CSS** = styling (the skin/clothes)\n- **JavaScript** = behavior (the muscles)\n\nHTML alone gives you a plain but functional page. CSS makes it look good. JavaScript makes it interactive.`,
    followup: `Want me to go deeper on a specific HTML topic — forms, tables, semantic tags, or how HTML connects to CSS and JavaScript?`,
  };
}

function aiMlResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/bca|student|beginner|start|learn|path|roadmap/.test(lower)) {
    return {
      content: `### Learning AI & ML as a BCA Student\n\nGreat choice — AI/ML is one of the highest-demand fields right now, and as a BCA student you already have the programming foundation. Here's a realistic roadmap:\n\n### Phase 1 — Foundations (Months 1–2)\n\n1. **Python proficiency** — you need to be comfortable with functions, loops, lists, dicts, and classes\n2. **Math basics** — don't skip this:\n   - Linear algebra: vectors, matrices, dot product\n   - Statistics: mean, variance, standard deviation, distributions\n   - Probability: basic probability, Bayes' theorem\n   - Calculus: derivatives (for understanding gradient descent)\n3. **NumPy & Pandas** — the two libraries you'll use every single day\n\n\`\`\`python\nimport numpy as np\nimport pandas as pd\n\n# NumPy array\narr = np.array([1, 2, 3, 4])\nprint(arr.mean())  # 2.5\n\n# Pandas DataFrame\ndf = pd.DataFrame({"name": ["Disha", "Sam"], "marks": [85, 92]})\nprint(df.describe())\n\`\`\`\n\n### Phase 2 — Core ML (Months 3–4)\n\n1. **Scikit-learn** — start here, not with deep learning\n2. **Learn the ML workflow**: data → preprocess → train → evaluate → predict\n3. **Algorithms to know**:\n   - Linear & logistic regression\n   - Decision trees & random forests\n   - K-means clustering\n   - KNN (K-nearest neighbors)\n4. **Key concepts**: train/test split, overfitting, cross-validation, feature scaling\n\n\`\`\`python\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint(model.score(X_test, y_test))  # R² score\n\`\`\`\n\n### Phase 3 — Deep Learning (Months 5–6)\n\n1. **TensorFlow or PyTorch** — pick one (PyTorch is more Pythonic, TF has better deployment)\n2. **Neural network basics**: layers, activation functions, backpropagation\n3. **Build a simple image classifier** on MNIST (handwritten digits)\n4. **Learn about CNNs** (for images) and RNNs (for sequences)\n\n### Phase 4 — Projects & Portfolio (Ongoing)\n\n1. **Kaggle** — enter beginner competitions, study top solutions\n2. **Build 2–3 projects**: house price prediction, sentiment analysis, image classifier\n3. **Document on GitHub** with clear READMEs\n4. **Write about what you learn** — LinkedIn or a blog\n\n### BCA-specific advice\n\n- Your math courses matter — pay attention to statistics and discrete math\n- Do a **mini-project each semester** using ML — it builds your portfolio\n- Don't jump to deep learning before mastering classical ML — you'll get lost\n- **Internships**: target data analyst or ML intern roles in your 4th–5th semester\n- **Free resources**: Andrew Ng's Coursera course, Kaggle Learn, fast.ai\n\n### Weekly study plan\n\n| Day | Focus |\n|-----|-------|\n| Mon | Python + math (1 hr) |\n| Tue | NumPy/Pandas practice (1 hr) |\n| Wed | ML algorithm theory (1 hr) |\n| Thu | Hands-on coding with scikit-learn (1 hr) |\n| Fri | Kaggle / project work (1.5 hr) |\n| Sat | Read papers or watch lectures (1 hr) |\n| Sun | Review + write summary (30 min) |`,
      followup: `Want me to go deeper on any phase, suggest specific free courses, or help you pick a first ML project?`,
    };
  }

  if (/neural|deep learning|cnn|rnn|transformer/.test(lower)) {
    return {
      content: `### Neural Networks & Deep Learning\n\nA neural network is a model inspired by the brain — layers of connected "neurons" that learn patterns from data.\n\n### How it works (simplified)\n\n1. **Input layer** receives data (e.g., pixel values of an image)\n2. **Hidden layers** transform the data using weights and activation functions\n3. **Output layer** produces the prediction (e.g., "cat" or "dog")\n4. **Training**: the network compares its prediction to the correct answer, calculates error, and adjusts weights using **backpropagation**\n\n### Simple neural network in PyTorch\n\n\`\`\`python\nimport torch\nimport torch.nn as nn\n\nclass SimpleNet(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.layer1 = nn.Linear(784, 128)  # input → hidden\n        self.layer2 = nn.Linear(128, 10)   # hidden → output\n        self.relu = nn.ReLU()\n\n    def forward(self, x):\n        x = self.relu(self.layer1(x))\n        return self.layer2(x)\n\nmodel = SimpleNet()\nprint(model)\n\`\`\`\n\n### Types of networks\n\n| Type | Best for |\n|------|----------|\n| **CNN** | Images, vision |\n| **RNN/LSTM** | Sequences, text, time series |\n| **Transformer** | NLP, language models (GPT) |\n| **GAN** | Generating images |\n\n### Key terms\n\n- **Epoch**: one full pass through the training data\n- **Batch size**: number of samples processed at once\n- **Learning rate**: how big each weight update is (too high = unstable, too low = slow)\n- **Activation function**: ReLU, sigmoid, tanh — introduces non-linearity\n- **Loss function**: measures how wrong the prediction is (MSE, cross-entropy)`,
    };
  }

  return {
    content: `### AI & Machine Learning\n\n**Artificial Intelligence (AI)** is the broad field of making computers do things that normally require human intelligence. **Machine Learning (ML)** is a subset where computers learn patterns from data instead of being explicitly programmed.\n\n### The hierarchy\n\n\`\`\`\nArtificial Intelligence\n  └── Machine Learning\n        ├── Supervised Learning (labeled data)\n        │     ├── Classification (spam/not spam)\n        │     └── Regression (predict a number)\n        ├── Unsupervised Learning (no labels)\n        │     ├── Clustering (group similar items)\n        │     └── Dimensionality reduction\n        └── Reinforcement Learning (learn by reward)\n  └── Deep Learning (neural networks)\n        ├── CNN (images)\n        ├── RNN (sequences)\n        └── Transformers (NLP, GPT)\n\`\`\`\n\n### Supervised vs Unsupervised\n\n| | Supervised | Unsupervised |\n|---|-----------|-------------|\n| Data | Labeled | Unlabeled |\n| Goal | Predict output | Find patterns |\n| Example | Spam detection | Customer segmentation |\n\n### The ML workflow\n\n1. **Collect data** — the most important step\n2. **Clean & preprocess** — handle missing values, scale features\n3. **Split** — train/test split (usually 80/20)\n4. **Choose a model** — start simple (linear regression), then try more complex\n5. **Train** — fit the model to training data\n6. **Evaluate** — test on unseen data, check accuracy/precision/recall\n7. **Tune** — adjust hyperparameters, try different models\n8. **Deploy** — use the model in production\n\n### Tools you'll use\n\n- **Python** — the language\n- **NumPy** — numerical computing\n- **Pandas** — data manipulation\n- **Matplotlib/Seaborn** — visualization\n- **Scikit-learn** — classical ML algorithms\n- **TensorFlow/PyTorch** — deep learning`,
    followup: `Are you just starting out, or do you have some experience? I can suggest a learning path, explain a specific algorithm, or help with a project idea.`,
  };
}

function bcaResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase();

  if (/project|mini project|final year/.test(lower)) {
    return {
      content: `### BCA Project Ideas\n\nProjects are the #1 thing that gets you hired. Here are ideas by difficulty:\n\n### Beginner (2nd–3rd semester)\n\n1. **Student Management System** — CRUD app with a database (Python/Java + MySQL)\n2. **Library Management System** — track books, members, issues/returns\n3. **Weather App** — fetch data from a public API and display it\n4. **Quiz App** — timed MCQ app with score tracking\n5. **Expense Tracker** — add/view/chart daily expenses\n\n### Intermediate (4th–5th semester)\n\n1. **E-commerce Store** — product catalog, cart, checkout (MERN or Django)\n2. **Chat Application** — real-time chat with WebSocket\n3. **Blog Platform** — posts, comments, auth, rich text editor\n4. **Task Manager (LifeOS-style)** — tasks, calendar, reminders, dashboard\n5. **Resume Builder** — template-based PDF generator\n\n### Advanced (6th semester / final year)\n\n1. **AI Chatbot** — NLP-based assistant (Python + NLTK/spaCy)\n2. **Face Recognition Attendance** — OpenCV + face detection\n3. **Sentiment Analyzer** — classify reviews as positive/negative (scikit-learn)\n4. **Full-stack Web App** — React + Node + PostgreSQL with auth and deployment\n5. **Mobile App** — React Native or Flutter, deployed to Play Store\n\n### How to pick\n\n1. **Match your interest** — you'll actually finish it if you care about it\n2. **Solve a real problem** — not just a tutorial clone\n3. **Use technologies you want in your job** — if you want web dev, build a web app\n4. **Keep scope small** — a working small project beats an unfinished big one\n5. **Document everything** — README, screenshots, demo video\n\n### What employers look for\n\n- Working code on GitHub (not just a zip file)\n- Clear README explaining what it does and how to run it\n- A live demo link (deploy it — Vercel, Netlify, Railway)\n- Your role and what you learned`,
      followup: `What technologies are you comfortable with? I can suggest a project that fits your skills and timeline.`,
    };
  }

  if (/career|job|salary|placement/.test(lower)) {
    return {
      content: `### BCA Career Paths\n\nA BCA opens doors to several career paths. Here's what's realistic and how to prepare:\n\n### Top career options after BCA\n\n| Role | What you do | Starting salary (India) |\n|------|------------|------------------------|\n| Software Developer | Build web/mobile apps | 3–6 LPA |\n| Data Analyst | Analyze data, make dashboards | 3–5 LPA |\n| ML Engineer (with extra study) | Build ML models | 4–8 LPA |\n| Web Developer | Frontend/backend web | 3–6 LPA |\n| QA/Testing Engineer | Test software quality | 2.5–4 LPA |\n| System Administrator | Manage servers/infrastructure | 2.5–4 LPA |\n\n### How to maximize your placement chances\n\n1. **Projects > grades** — a 7.5 CGPA with 3 good projects beats a 9.0 with none\n2. **Build a portfolio** — 2–3 real projects on GitHub with live demos\n3. **Learn one stack well** — don't try to learn everything. Pick:\n   - **MERN** (MongoDB, Express, React, Node) for full-stack web\n   - **Python + Django/Flask** for backend\n   - **Java + Spring** for enterprise roles\n4. **Practice DSA** — Data Structures & Algorithms are tested in most interviews. Use LeetCode/GeeksforGeeks\n5. **Get an internship** — even a 3-month internship dramatically increases placement salary\n6. **Build a LinkedIn profile** — connect with recruiters, post your projects\n\n### Higher study options\n\n- **MCA** (3 years) — deepens CS knowledge, opens teaching/research roles\n- **MSc CS/IT** — research-oriented\n- **MBA** — if you want to move toward management\n- **Certifications** — AWS, Google Cloud, Meta Frontend Developer (Coursera)\n\n### Skills that differentiate you\n\n- **Git & GitHub** — version control is mandatory, not optional\n- **Linux basics** — command line, file permissions, basic scripting\n- **Cloud** — deploy something to AWS/GCP/Vercel\n- **Communication** — being able to explain your project clearly is as important as building it`,
      followup: `Which career path interests you most? I can suggest specific skills to learn and projects to build for that path.`,
    };
  }

  if (/subject|syllabus|semester|course|study/.test(lower)) {
    return {
      content: `### BCA Subject Guide\n\nBCA (Bachelor of Computer Applications) is a 3-year, 6-semester degree. Here's what to focus on each semester:\n\n### Semester 1–2 — Foundations\n\n- **C Programming** — the most important foundation. Master pointers, arrays, functions, structs\n- **Digital Electronics** — logic gates, Boolean algebra, flip-flops\n- **Mathematics** — calculus, algebra, discrete math (this matters for ML later!)\n- **English/Communication** — don't ignore this; communication skills get you hired\n\n### Semester 3–4 — Core CS\n\n- **Data Structures** — arrays, linked lists, stacks, queues, trees, graphs. **This is the most tested topic in interviews**\n- **OOP (C++ or Java)** — classes, inheritance, polymorphism, encapsulation\n- **DBMS** — SQL, normalization, ER diagrams, joins. Learn PostgreSQL or MySQL\n- **Operating Systems** — processes, threads, scheduling, memory management\n- **Computer Networks** — OSI model, TCP/IP, protocols\n\n### Semester 5–6 — Advanced & Applied\n\n- **Web Technologies** — HTML, CSS, JavaScript, a framework (React or Angular)\n- **Software Engineering** — SDLC, testing, agile, project management\n- **Python / R** — for data science and scripting\n- **AI/ML basics** — if your syllabus includes it, take it seriously\n- **Mini project / Major project** — this is your portfolio piece\n\n### Study strategy per semester\n\n1. **Don't just memorize** — practice coding every week, not just before exams\n2. **Build something with each subject** — learned DBMS? Build a small app with a database\n3. **Focus on Data Structures and OOP** — these two subjects appear in every technical interview\n4. **Keep a GitHub repo** — upload every assignment and project. By graduation you'll have a portfolio\n5. **Solve previous year papers** — exam patterns repeat, and it's the best exam prep`,
      followup: `Which semester are you in, or which subject do you need help with? I can explain specific topics or help you plan your study schedule.`,
    };
  }

  return {
    content: `### BCA (Bachelor of Computer Applications)\n\nBCA is a 3-year undergraduate degree focused on computer applications, software development, and IT. Here's what I can help you with:\n\n### I can help you with\n\n- **Subject explanations** — C programming, data structures, OOP, DBMS, web tech, OS, networks\n- **Project ideas** — mini projects and final-year projects by difficulty and technology\n- **Career guidance** — job paths after BCA, salary ranges, skills to build, higher study options\n- **Study planning** — semester-wise focus areas, exam prep schedules\n- **Programming help** — C, C++, Java, Python, HTML/CSS/JS with examples\n\n### Quick tips for BCA students\n\n1. **Start coding from semester 1** — don't wait. Even 30 min/day compounds\n2. **Build projects, not just assignments** — projects are what get you hired\n3. **Learn Git & GitHub early** — version control is a core professional skill\n4. **Focus on Data Structures** — it's the most tested topic in every tech interview\n5. **Do at least one internship** — experience beats grades for hiring\n\n### What do you need help with?\n\n- A specific subject or topic?\n- Project ideas for your semester?\n- Career planning after BCA?\n- Study schedule for exams?`,
    followup: `Tell me which semester you're in or what you need help with, and I'll give you specific guidance.`,
  };
}

function studyPlanningResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const subjectMatch = input.match(/(?:study|learn|revise|review)\s+(?:for\s+)?(.+?)(?:\?|$|\.|,)/i);
  const subject = subjectMatch?.[1]?.trim();
  const hoursMatch = input.match(/(\d+)\s*(?:hr|hour|hrs|hours)/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : null;

  let blocks: string;
  if (hours && hours <= 2) {
    blocks = `### Study Session (~${hours} hour${hours > 1 ? 's' : ''})\n\n1. **Block 1** (0:00–0:25): Active reading — highlight key concepts\n2. **Break** (0:25–0:30): 5-min break (stand, water)\n3. **Block 2** (0:30–0:55): Practice problems\n4. **Break** (0:55–1:00): 5-min break\n5. **Block 3** (1:00–${hours === 2 ? '1:25' : '1:00'}): ${hours === 2 ? 'Review + summarize notes' : 'Quick review'}`;
  } else if (hours && hours > 2) {
    blocks = `### Study Session (~${hours} hours)\n\n1. **Block 1** (0:00–0:50): Active reading & note-taking\n2. **Break** (0:50–1:00): 10-min walk\n3. **Block 2** (1:00–1:50): Practice problems\n4. **Break** (1:50–2:00): Snack, stretch\n5. **Block 3** (2:00–2:50): Review + self-test\n6. **Break** (2:50–3:00): Rest eyes\n7. **Block 4** (3:00–${hours}:00): Weak-spot focus + summary`;
  } else {
    blocks = `### Study Session (Pomodoro, ~2 hours)\n\n1. **Block 1** (25 min): Active reading — focus on key concepts\n2. **Break** (5 min): Step away from desk\n3. **Block 2** (25 min): Practice problems\n4. **Break** (5 min)\n5. **Block 3** (25 min): Review + summarize in your own words\n6. **Long break** (15 min): Walk, hydrate\n7. **Block 4** (25 min): Self-test on what you just learned`;
  }

  return {
    content: `${subject ? `Here's a structured study plan for **${subject}**.` : "Here's a structured study plan you can follow."}\n\n${blocks}\n\n### Tips for this session\n\n- **Set a single goal** before you start — "understand X" beats "study chapter 5"\n- **Active recall** > re-reading: close the book and explain the concept aloud\n- **Track weak spots**: jot down anything you got wrong for your next session\n- **Hydrate & move** during breaks — your brain needs blood flow, not more screen time\n\n### After the session\n\n- Spend 5 minutes writing a quick summary of what you learned\n- Add any follow-up tasks to your To-Do list so you don't forget\n- Schedule your next session within 24–48 hours (spaced repetition works)`,
    followup: subject
      ? `Want me to break this into daily tasks, or adjust the time blocks?`
      : `What subject or topic are you studying? I can tailor the plan more specifically.`,
  };
}

function examPrepResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const examMatch = input.match(/(?:exam|test)\s+(?:in|for|on)\s+(.+?)(?:\?|$|\.|,| in \d)/i);
  const daysMatch = input.match(/(?:in|within)\s+(\d+)\s*(?:day|days|week|weeks)/i);
  const subject = examMatch?.[1]?.trim();
  const daysRaw = daysMatch?.[1] ? parseInt(daysMatch[1]) : null;
  const days = daysRaw ? (input.match(/week/i) ? daysRaw * 7 : daysRaw) : 7;

  const reviewDay = Math.max(1, Math.floor(days / 3));
  const practiceDay = Math.max(2, Math.floor((days * 2) / 3));

  return {
    content: `${subject ? `Here's a ${days}-day exam prep plan for **${subject}**.` : `Here's a ${days}-day exam prep plan.`}\n\n### Phase 1 — Coverage (Days 1–${reviewDay})\n\n- Map the full syllabus — list every topic that could appear\n- Rate each topic by weight (marks) and your confidence (high/med/low)\n- Work through low-confidence topics first while energy is high\n- Take brief notes — focus on understanding, not copying\n\n### Phase 2 — Practice (Days ${reviewDay + 1}–${practiceDay})\n\n- Switch to active recall: close notes and explain each topic aloud\n- Do past papers / practice questions under timed conditions\n- Track every mistake in a "weak-spot log"\n- Revisit weak-spot log topics every 2 days (spaced repetition)\n\n### Phase 3 — Polish (Days ${practiceDay + 1}–${days})\n\n- Full mock exam under real conditions (timed, no breaks)\n- Review weak-spot log one final time\n- Light review only the day before — no cramming\n- Sleep 7–8 hours, eat well, hydrate — your brain consolidates overnight\n\n### Daily rhythm (each study day)\n\n1. **Morning block** (90 min): Hardest topic — your mind is freshest\n2. **Break** (15 min): Move, eat, step outside\n3. **Afternoon block** (60 min): Practice questions\n4. **Break** (10 min)\n5. **Evening block** (45 min): Review the day's weak spots + plan tomorrow\n\n### Quick tips\n\n- **Active recall beats re-reading** — test yourself, don't just look\n- **Sleep is non-negotiable** — memory consolidation happens at night\n- **Past papers > textbook** in the final week — examiners repeat patterns`,
    followup: `Want me to turn any phase into specific tasks with due dates, or adjust the timeline?`,
  };
}

function dailyPlanningResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `Here's a realistic daily plan you can adapt:\n\n### Morning\n\n1. **7:00 AM** — Wake up, hydrate, 5 min stretch\n2. **7:30 AM** — Light breakfast + review your top 3 priorities\n3. **8:00 AM** — Deep work block 1 (90 min): most important/hardest task\n4. **9:30 AM** — 15-min break: walk, snack, no phone\n5. **9:45 AM** — Deep work block 2 (60 min): second priority\n\n### Afternoon\n\n6. **11:00 AM** — Batch smaller tasks, messages, emails\n7. **12:30 PM** — Lunch + genuine rest\n8. **1:30 PM** — Study or work block (60–90 min)\n9. **3:00 PM** — 15-min break\n10. **3:15 PM** — Lighter tasks, meetings, errands\n11. **4:30 PM** — Exercise or movement (30 min)\n\n### Evening\n\n12. **6:00 PM** — Dinner + downtime\n13. **7:30 PM** — Optional study/review block (45 min)\n14. **9:00 PM** — Wind down: no screens, read or journal\n15. **9:30 PM** — Review the day, plan tomorrow's top 3\n16. **10:30 PM** — Sleep (aim for 7–8 hours)\n\n### Principles\n\n- **Deep work first**: your brain is sharpest in the first 2–3 hours\n- **Batch shallow work**: messages and emails in one window\n- **Breaks are productive**: rest is when your brain consolidates\n- **Plan the night before**: start with momentum, not decision fatigue`,
    followup: `Want me to adjust the wake time, add specific tasks, or make this a weekly plan?`,
  };
}

function productivityResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Productivity Strategies\n\nProductivity isn't about doing more — it's about doing the right things with focus.\n\n### 1. Time blocking\n\nSchedule everything on your calendar instead of a to-do list:\n\n\`\`\`\n9:00–10:30  → Write essay intro\n10:30–10:45 → Break\n10:45–12:00 → Study chapter 5\n\`\`\`\n\nIt forces you to be realistic about time and eliminates "what next?" decisions.\n\n### 2. The 2-minute rule\n\nIf a task takes less than 2 minutes, do it now — don't add it to a list.\n\n### 3. Eat the frog\n\nDo your hardest task first thing in the morning. Willpower is highest early.\n\n### 4. Pomodoro technique\n\n- 25 min focused work → 5 min break → repeat\n- After 4 cycles, take a 15–30 min break\n- Great for procrastination — "just 25 minutes" feels doable\n\n### 5. Weekly review\n\nEvery Sunday, 30 minutes:\n1. Review what you accomplished\n2. List next week's top 3–5 outcomes\n3. Schedule them into time blocks\n4. Clear your inbox and task list\n\n### 6. Energy management\n\n- **High energy** → deep work, hard problems\n- **Medium energy** → meetings, planning, writing\n- **Low energy** → admin, emails, organizing\n\n### Quick wins today\n\n- Put your phone in another room during deep work\n- Write tomorrow's top 3 tonight\n- Take a real lunch break — away from your desk\n- Set a 5-minute timer to start a task you're avoiding`,
    followup: `Which strategy resonates? I can help you build a specific system.`,
  };
}

function todoResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Organizing Your To-Do List\n\n### Step 1 — Brain dump\n\nWrite everything on your mind — don't filter, don't prioritize yet.\n\n### Step 2 — Categorize\n\n- **Work / Study** — deadlines, projects, assignments\n- **Personal** — health, home, relationships\n- **Errands** — things that require going somewhere\n- **Someday** — ideas with no deadline\n\n### Step 3 — Prioritize (Eisenhower matrix)\n\n| | Urgent | Not urgent |\n|---|--------|-----------|\n| **Important** | DO NOW | SCHEDULE |\n| **Not important** | DELEGATE | DELETE |\n\n### Step 4 — Break down big tasks\n\n"Write thesis" is a project, not a task. Break it into:\n\n1. Research 5 sources (2 hrs)\n2. Write outline (1 hr)\n3. Draft introduction (2 hrs)\n4. Draft chapter 1 (4 hrs)\n\n### Step 5 — Daily execution\n\n1. Each evening, pick **3 tasks** for tomorrow\n2. Schedule them into time blocks\n3. Do them in order\n4. Check off what's done, carry forward the rest\n\n### Pro tips\n\n- **Due date ≠ do date**: assign a *when*, not just a deadline\n- **Context tags**: @home, @campus, @computer\n- **Weekly reset**: review, delete stale items, re-prioritize`,
    followup: `Want me to help break down a specific task, or set up a weekly review?`,
  };
}

function diaryResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Diary & Reflection\n\nWriting about your day is a tool for self-awareness and growth.\n\n### Simple reflection framework\n\nEach evening, 10 minutes:\n\n1. **What happened today?** — factual summary\n2. **What went well?** — one thing you're grateful for\n3. **What didn't go well?** — one thing you'd change\n4. **What did you learn?** — one insight\n5. **What will you do differently tomorrow?** — one adjustment\n\n### Deeper prompts\n\n- **Stress check**: "What's weighing on me? What can I control?"\n- **Values check**: "Did I act in line with who I want to be?"\n- **Energy check**: "When did I feel most alive? Most drained?"\n- **Relationship check**: "Who did I connect with today?"\n\n### Why it works\n\n- **Externalizing reduces anxiety** — getting thoughts on paper reduces rumination\n- **Pattern recognition** — after weeks, you'll see what drains and energizes you\n- **Evidence of growth** — old entries show progress you can't see daily\n\n### Tips\n\n- 5 minutes daily beats 30 minutes monthly\n- Write fast, don't censor — this is for you\n- Tag entries with mood (calm, stressed, motivated)\n- Review weekly on Sunday — what's the theme?`,
    followup: `Want me to suggest a specific prompt for tonight's entry?`,
  };
}

function motivationResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### You've got this.\n\nMotivation is unreliable — it shows up when things are easy and disappears when they're hard. The people who succeed aren't the ones who feel motivated every day. They're the ones who show up anyway.\n\n### What to do right now\n\n1. **Pick one thing** — not the whole mountain, just the next step\n2. **Set a 5-minute timer** — work for 5 minutes. If you want to stop, stop. But you usually won't.\n3. **Remove friction** — phone away, tabs closed, desk clear\n4. **Remember your why** — what do you actually want to build or become?\n\n### The truth about motivation\n\n- **Action creates motivation**, not the other way around\n- **Discipline > motivation**: doing it when you don't feel like it is the skill\n- **Progress fuels persistence**: track it visibly — seeing progress is motivating\n\n### When you're stuck\n\n- **Lower the bar**: a bad draft beats a blank page\n- **Change your state**: stand up, drink water, step outside for 2 min\n- **Talk to someone**: isolation breeds procrastination\n\n### One question\n\nWhat would the person you want to become do right now? Go do that.`,
  };
}

function stressResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### I hear you.\n\nFeeling overwhelmed is a signal, not a failure. Let's create some space:\n\n### Right now — next 5 minutes\n\n1. **Breathe** — 4 seconds in, hold 4, out 4, hold 4. Do this 4 times.\n2. **Brain dump** — write down everything on your mind. Don't organize. Just get it out.\n3. **Pick ONE thing** — from that list, the single most important task.\n4. **Make it small** — "open the document" not "write the essay."\n5. **Set a 5-minute timer** — start. You'll likely keep going.\n\n### When the overwhelm is bigger\n\n- You don't have to do everything today. Most of it can wait.\n- Done is better than perfect. A B+ submitted beats an A+ never started.\n- Ask for help — a friend, a professor, a counselor.\n- Rest is productive. Your brain recovers during rest.\n\n### For tonight\n\n1. Write a diary entry about how you're feeling\n2. Plan tomorrow's top 3 — only 3\n3. Sleep 7+ hours — everything feels more manageable after rest\n\nYou're not behind. You're exactly where you are. Take one step.`,
    followup: `What's the one thing weighing on you most right now?`,
  };
}

function remindersResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Reminders in LifeOS\n\nThe Reminders page lets you set time-based alerts.\n\n### What you can do\n\n1. Create a reminder with title, date, and time\n2. Set repeats — daily, weekly, monthly\n3. View all reminders sorted by date\n4. Delete or edit any reminder\n\n### Best practices\n\n- One reminder per task — don't bundle\n- Set precise times — "7:00 PM" beats "evening"\n- Use repeats for habits — daily study, weekly review\n- Don't over-remind — if everything pings, you'll ignore everything`,
    followup: `Want me to suggest recurring reminders based on your goals?`,
  };
}

function calendarResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Calendar in LifeOS\n\nThe Calendar page tracks dates — exams, events, deadlines, birthdays.\n\n### What you can do\n\n1. Click any date to see what's scheduled\n2. Double-click to add a new event\n3. View events in a monthly grid\n4. Navigate months with arrows\n\n### How to use it\n\n- Add deadlines as events — seeing them makes them real\n- Block study time — treat sessions like meetings with yourself\n- Review weekly — every Sunday, check the upcoming week\n\n### Calendar + Tasks + Reminders\n\n- **Calendar**: *when* things happen\n- **To-Do**: *what* you need to do\n- **Reminders**: *nudges* so you don't forget`,
    followup: `Want me to help plan what to put on your calendar this week?`,
  };
}

function wardrobeResponse(input: string, ctx: AssistantContext): AssistantResponse {
  return {
    content: `### Wardrobe in LifeOS\n\nCatalog your clothing by category — tops, bottoms, dresses, shoes, accessories, outerwear.\n\n### What you can do\n\n1. Add items with name, color, brand, and photo\n2. Browse by category\n3. Plan outfits by mixing items\n\n### Why catalog your wardrobe\n\n- Stop buying duplicates\n- Plan outfits visually\n- Track what you actually wear\n- Easy travel packing`,
    followup: `Want help organizing a specific category?`,
  };
}

function generalResponse(input: string, ctx: AssistantContext): AssistantResponse {
  const lower = input.toLowerCase().trim();

  if (/thank/.test(lower)) {
    return {
      content: `You're welcome! I'm always here when you need to plan, study, organize, code, or think something through. Come back anytime.`,
    };
  }

  if (/bye|goodbye|see you|gtg|good night|goodnight/.test(lower)) {
    return {
      content: `Take care! Come back whenever you need help with studying, coding, planning, or just thinking things through. I'll be here.`,
    };
  }

  if (/how are you|how.?s it going|what.?s up|whats up|sup/.test(lower)) {
    return {
      content: `I'm doing great, thanks for asking! I'm always ready to help.\n\nWhat can I do for you today? I can help with:\n- Study plans and exam prep\n- Programming (Python, Java, C/C++, HTML, JavaScript)\n- AI/ML learning paths\n- BCA and college guidance\n- Daily planning and productivity\n- Or just a conversation`,
    };
  }

  const prev = getHistory(ctx);
  const isFollowUp = /^(tell me more|what about|can you explain|more|continue|elaborate|another example|go deeper|and|also|what else)/i.test(lower);

  if (isFollowUp && prev) {
    return {
      content: `Great — let's go deeper on what we were just discussing.\n\nTo give you the most useful answer, could you tell me:\n\n- Which specific part would you like me to expand on?\n- Are you looking for more explanation, more examples, or practical steps?\n- Is there a particular aspect you're finding confusing?\n\nThe more specific you can be, the more targeted my answer will be.`,
      followup: `For example, if we were talking about Python functions, you could say "show me a more complex example" or "explain lambda functions."`,
    };
  }

  if (/\?$/.test(input.trim()) || /^(what|why|how|when|where|who|which|can|should|could|would|do|is|are|am|will|does|did)\b/.test(lower)) {
    const topic = input.replace(/[?.!]+$/, '').trim();

    const topicHints: { keywords: string[]; hint: string }[] = [
      { keywords: ['python', 'function', 'class', 'loop', 'list', 'dict'], hint: 'Python programming' },
      { keywords: ['java', 'jvm', 'servlet'], hint: 'Java programming' },
      { keywords: ['c ', 'c++', 'pointer', 'struct', 'malloc'], hint: 'C/C++ programming' },
      { keywords: ['html', 'css', 'web', 'frontend', 'tag'], hint: 'web development' },
      { keywords: ['ai', 'ml', 'machine learning', 'neural', 'deep learning'], hint: 'AI/ML' },
      { keywords: ['bca', 'college', 'semester', 'exam'], hint: 'BCA/college' },
      { keywords: ['plan', 'schedule', 'time', 'productivity'], hint: 'planning/productivity' },
    ];

    const matchedHint = topicHints.find((t) => t.keywords.some((k) => lower.includes(k)));

    return {
      content: `That's a good question about "${topic}".\n\n${matchedHint ? `This seems related to **${matchedHint.hint}**. ` : ''}I want to give you a genuinely useful answer, not a generic one. Could you tell me a bit more?\n\n- What's your specific situation or goal?\n- Are you looking for an explanation, a practical example, or a step-by-step guide?\n- What level of detail do you need — beginner overview or deep dive?\n\nOnce I know a bit more, I can give you a targeted, detailed answer with examples and action steps.`,
      followup: `You can also try asking me directly — for example: "Explain Python functions with an example", "Make me a study plan for exams", or "How do I learn AI as a BCA student?"`,
    };
  }

  return {
    content: `I'm here to help with a wide range of topics. Here's what I'm best at:\n\n### Programming\n\n- **Python** — functions, classes, loops, data structures\n- **Java** — classes, inheritance, arrays, ArrayLists\n- **C / C++** — pointers, structs, STL, memory management\n- **HTML** — structure, forms, tables, semantic tags\n- **JavaScript / React** — hooks, async/await, components\n\n### AI & ML\n\n- Learning paths for BCA students\n- ML workflow, algorithms, neural networks\n- Career guidance in AI/ML\n\n### Study & Planning\n\n- Study plans, exam prep timelines\n- Daily schedules, time blocking\n- Task organization, productivity systems\n- Project planning\n\n### College & Career\n\n- BCA subject guidance, semester-wise focus\n- Project ideas by semester\n- Career paths after BCA\n\n### Reflection\n\n- Diary prompts, motivation, stress management\n\nWhat would you like help with?`,
    followup: `Try: "Explain Python functions", "Make me a study plan", "What is HTML?", or "How should I learn AI as a BCA student?"`,
  };
}

const intents: Intent[] = [
  {
    id: 'greeting',
    weight: 100,
    match: (_input, lower) => /^(hi|hello|hey|yo|sup|hola|good (morning|afternoon|evening))\b/i.test(lower) && lower.length < 30,
    handler: greetingResponse,
  },
  {
    id: 'bye',
    weight: 100,
    match: (_input, lower) => /\b(bye|goodbye|see you|good night|goodnight|gtg)\b/i.test(lower),
    handler: generalResponse,
  },
  {
    id: 'howareyou',
    weight: 100,
    match: (_input, lower) => /(how are you|how.?s it going|what.?s up|whats up|sup)\b/i.test(lower),
    handler: generalResponse,
  },
  {
    id: 'thanks',
    weight: 100,
    match: (_input, lower) => /\b(thank|thanks|thx|appreciate)\b/i.test(lower),
    handler: generalResponse,
  },
  {
    id: 'ai_ml_bca',
    weight: 90,
    match: (input, lower) => {
      const hasAI = /\b(ai|artificial intelligence|machine learning|ml|deep learning|neural)\b/i.test(lower);
      const hasBCA = /\b(bca|student|beginner|start learning)\b/i.test(lower);
      return hasAI && (hasBCA || /learn|path|roadmap|career|guide/i.test(lower));
    },
    handler: aiMlResponse,
  },
  {
    id: 'ai_ml',
    weight: 80,
    match: (_input, lower) => /\b(ai|artificial intelligence|machine learning|ml|deep learning|neural network|cnn|rnn|transformer|tensorflow|pytorch|scikit|sklearn)\b/i.test(lower),
    handler: aiMlResponse,
  },
  {
    id: 'bca',
    weight: 85,
    match: (_input, lower) => /\b(bca)\b/i.test(lower) || (/\b(college|semester|syllabus)\b/i.test(lower) && /\b(bca|computer application)\b/i.test(lower)),
    handler: bcaResponse,
  },
  {
    id: 'python',
    weight: 85,
    match: (_input, lower) => /\b(python|django|flask|pandas|numpy)\b/i.test(lower),
    handler: pythonResponse,
  },
  {
    id: 'java',
    weight: 85,
    match: (_input, lower) => /\b(java|jvm|servlet|spring)\b/i.test(lower) && !/javascript/i.test(lower),
    handler: javaResponse,
  },
  {
    id: 'cpp',
    weight: 85,
    match: (_input, lower) => /\b(c\+\+|cpp|stl)\b/i.test(lower),
    handler: cppResponse,
  },
  {
    id: 'c_lang',
    weight: 80,
    match: (_input, lower) => {
      if (/\b(c\+\+|cpp)\b/i.test(lower)) return false;
      return /\b(c programming|c language|in c\b|pointer|struct|malloc|calloc|stdio)\b/i.test(lower) || /^c\b/i.test(lower);
    },
    handler: cResponse,
  },
  {
    id: 'html',
    weight: 85,
    match: (_input, lower) => /\b(html|web page|tag|element|form in html|html table)\b/i.test(lower),
    handler: htmlResponse,
  },
  {
    id: 'javascript',
    weight: 80,
    match: (_input, lower) => /\b(javascript|js|useeffect|usestate|react|jsx|tsx|node|npm|async|await|promise|array method|map filter)\b/i.test(lower),
    handler: (_input, _ctx) => ({
      content: `### JavaScript / React\n\nI can explain JavaScript and React concepts with examples. Here are the most common topics:\n\n### React Hooks\n\n\`\`\`tsx\nimport { useState, useEffect } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = \`Count: \${count}\`;\n  }, [count]);\n\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\`\`\`\n\n### Key hooks\n\n- **\`useState\`** — local state in a component\n- **\`useEffect\`** — side effects (fetching, subscriptions, DOM)\n- **\`useRef\`** — mutable value that doesn't trigger re-render\n- **\`useMemo\`** / **\`useCallback\`** — performance optimization\n\n### JavaScript essentials\n\n- **async/await** — cleaner Promises\n- **Array methods** — map, filter, reduce, find, some, every\n- **Destructuring** — \`const { name, age } = user\`\n- **Spread/rest** — \`{ ...obj }\`, \`[...arr, item]\`\n\n### Common gotchas\n\n1. **\`useEffect\` dependency array** — empty \`[]\` = run once, \`[dep]\` = run on dep change, no array = run every render\n2. **State updates are async** — use \`setCount(c => c + 1)\` not \`setCount(count + 1)\` when updating from previous value\n3. **Keys in lists** — use stable unique keys, not array index`,
      followup: `What specific JavaScript or React topic would you like me to explain in detail?`,
    }),
  },
  {
    id: 'exam',
    weight: 75,
    match: (_input, lower) => /\b(exam|test prep|prepare for|finals?|midterm|quiz)\b/i.test(lower),
    handler: examPrepResponse,
  },
  {
    id: 'study',
    weight: 70,
    match: (_input, lower) => /\b(study|study plan|study session|revise|review|memorize|flashcard|pomodoro)\b/i.test(lower),
    handler: studyPlanningResponse,
  },
  {
    id: 'daily',
    weight: 75,
    match: (_input, lower) => /(plan my day|daily plan|plan today|what should i do today|help me plan my day|morning routine|organize my day)/i.test(lower),
    handler: dailyPlanningResponse,
  },
  {
    id: 'productivity',
    weight: 70,
    match: (_input, lower) => /\b(productivity|productive|procrastinat|distract|concentrat|deep work|focus)\b/i.test(lower),
    handler: productivityResponse,
  },
  {
    id: 'todo',
    weight: 70,
    match: (_input, lower) => /\b(todo|to-do|task|organize|prioriti|priority|checklist|brain dump|eisenhower)\b/i.test(lower),
    handler: todoResponse,
  },
  {
    id: 'time',
    weight: 70,
    match: (_input, lower) => /(time management|manage time|time block|save time|too much time|wasting time|not enough time)/i.test(lower),
    handler: (_input, _ctx) => ({
      content: `### Time Management\n\n**You don't have a time problem — you have a priority problem.** Everyone has 24 hours.\n\n### 1. Audit your time\n\nTrack where your time goes for 3 days. You'll be surprised how much leaks into low-value activities.\n\n### 2. The 80/20 rule\n\n80% of results come from 20% of effort. Identify your high-impact 20%:\n\n- Which tasks actually move you toward your goals?\n- Which activities feel productive but aren't?\n\n### 3. Time blocking\n\n| Block | Duration | Rule |\n|-------|----------|------|\n| Deep work | 90 min | No phone, one task |\n| Shallow work | 45 min | Batch emails, admin |\n| Break | 15 min | Move, eat, no screens |\n\n### 4. The "one thing" method\n\nEach morning: **What is the ONE thing that makes everything else easier?** Do that first.\n\n### 5. Guard against time traps\n\n- **Phone**: put it in another room, not just silent\n- **Multitasking**: every switch costs 15–20 min of focus\n- **"Quick checks"**: 5 min of social media becomes 30. Use a timer\n\n### 6. Shutdown ritual\n\n1. Write what you accomplished\n2. Note where you'll pick up tomorrow\n3. Close all tabs\n4. Say: "Work is done for today"`,
      followup: `Want me to help build a time-blocked schedule for this week?`,
    }),
  },
  {
    id: 'project',
    weight: 70,
    match: (_input, lower) => /(project|build a|create a|make a|side project|app idea|startup|launch)/i.test(lower),
    handler: (_input, _ctx) => ({
      content: `### Project Planning\n\n### Phase 1 — Define\n\n1. Write a one-sentence goal\n2. Define "done" — what features must work?\n3. List constraints — deadline, tools, skills\n4. Identify the MVP — minimum version that delivers value\n\n### Phase 2 — Break down\n\n\`\`\`\nProject: Task Tracker App\n├── Setup\n│   ├── Initialize project          [2 hrs]\n│   └── Configure styling          [1 hr]\n├── Core (MVP)\n│   ├── Task model + state          [3 hrs]\n│   ├── Add task form              [2 hrs]\n│   ├── Task list + delete          [2 hrs]\n│   └── LocalStorage persistence   [1 hr]\n├── Polish\n│   ├── Styling + responsive        [3 hrs]\n│   └── Empty states               [2 hrs]\n└── Ship\n    ├── Build + deploy              [1 hr]\n    └── Write README               [30 min]\n\`\`\`\n\n### Phase 3 — Schedule\n\n1. Assign each task to a day\n2. Order by dependency\n3. Leave 20% buffer\n4. Set a hard deadline, work backward\n\n### Phase 4 — Execute & Ship\n\n- Daily: pick 1–3 tasks, do them, check off\n- Weekly: review, adjust, remove blockers\n- Ship: test end-to-end, fix top 3 bugs, deploy`,
      followup: `What project are you planning? I can break it into specific tasks with time estimates.`,
    }),
  },
  {
    id: 'career',
    weight: 65,
    match: (_input, lower) => /\b(career|job|internship|resume|portfolio|interview|hire|salary|linkedin|freelance)\b/i.test(lower),
    handler: (_input, _ctx) => ({
      content: `### Career & Skill Planning\n\n### 1. Self-assessment\n\n- **Strengths**: what comes easily that others find hard?\n- **Interests**: what do you do where you lose track of time?\n- **Values**: autonomy, impact, money, stability, creativity — rank them\n\n### 2. Pick a 2–3 year direction\n\n- "Become a front-end developer"\n- "Transition to data analyst"\n- "Build a freelance design business"\n\n### 3. Skill stacking (T-shaped)\n\n\`\`\`\nDeep:    React, TypeScript, CSS\nBroad:   Node.js, databases, Git, deployment\n\`\`\`\n\n### 4. Portfolio of evidence\n\n1. Build one real project per skill\n2. Write about it — README, blog post\n3. Share it — GitHub, LinkedIn\n\n### 5. 90-day action plan\n\n| Week | Focus |\n|-----|-------|\n| 1–2 | Complete a course on your target skill |\n| 3–6 | Build one portfolio piece |\n| 7–8 | Write a case study |\n| 9–10 | Do 3 informational interviews |\n| 11–12 | Send 10 applications |`,
      followup: `What field are you aiming for? I can tailor a skill roadmap.`,
    }),
  },
  {
    id: 'diary',
    weight: 65,
    match: (_input, lower) => /\b(diary|journal|reflect|reflection|write about|my day|gratitude)\b/i.test(lower),
    handler: diaryResponse,
  },
  {
    id: 'motivation',
    weight: 65,
    match: (_input, lower) => /\b(motivat|inspir|lazy|give up|can.?t do|unmotivated|stuck|keep going|goal setting)\b/i.test(lower),
    handler: motivationResponse,
  },
  {
    id: 'stress',
    weight: 70,
    match: (_input, lower) => /\b(stress|overwhelm|anxious|anxiety|burnt out|burned out|burnout|exhausted|mental health|depressed|can.?t cope)\b/i.test(lower),
    handler: stressResponse,
  },
  {
    id: 'reminders',
    weight: 60,
    match: (_input, lower) => /\b(remind|reminder|alert|notification)\b/i.test(lower),
    handler: remindersResponse,
  },
  {
    id: 'calendar',
    weight: 55,
    match: (_input, lower) => /\b(calendar|event|appointment|deadline|birthday)\b/i.test(lower),
    handler: calendarResponse,
  },
  {
    id: 'wardrobe',
    weight: 55,
    match: (_input, lower) => /\b(wardrobe|outfit|clothes|clothing|fashion)\b/i.test(lower),
    handler: wardrobeResponse,
  },
];

export function generateAssistantResponse(input: string, ctx: AssistantContext = { history: [] }): AssistantResponse {
  const lower = input.toLowerCase().trim();

  let bestMatch: Intent | null = null;
  for (const intent of intents) {
    if (intent.match(input, lower)) {
      if (!bestMatch || intent.weight > bestMatch.weight) {
        bestMatch = intent;
      }
    }
  }

  if (bestMatch) return bestMatch.handler(input, ctx);
  return generalResponse(input, ctx);
}
