# Styleguide / Code quality

## General

### Syntax
- Keep lines under ~100 characters in length, except where doing so would cause the code to become more unreadable. **Reasoning:** In split-screen editor layouts, ~100 chars is close to the width of an editor window.
- Keep function bodies to ~100 lines in length where possible. **Reasoning:** Interpreting the contents of a function is much easier for a new user when the user can fit the entire function onscreen at once.

### Methodology
- "It is easier to optimize correct code than to correct optimized code" - Bill Harlan
- If you're concerned about efficiency, don't use Node.js.
- Use bash/python/perl for scripting. Justification being that these interpreters come pre-installed on most *nix systems, and are more fit for purpose for scripting than Node.
- A task is not complete until it is tested and documented. Use TDD where possible.
- If you find yourself saying _"This function cannot easily be unit tested"_, then it's a good sign that it needs to be redesigned.
- Make your code tend towards being explicit, avoid the use of implicit events and triggers. Keep control flow easy to follow for the next developer. If your business logic relies on implicit functionality (ie: _"action x triggers event y somewhere else"_), clearly document it as such.
- If you found an answer online to a difficult problem, leave a comment with the link to the answer explaining the implementation. **Reasoning:** It might not be immediately obvious to the next developer what led you to implement the fix, increasing  the risk of regression errors. Comments should describe the bug that it resolves, and tests should be implemented to test against its regression.


## Support scripts
- Use `ALL_CAPS_SNAKE_CASE` for constant and exported variable names. Use `regular_snake_case` for local variable names. **Reasoning:** This mitigates the risk of overwriting native shell or external variables.
- Do not use spaces either side of assignments, to minimise any possible inconsistencies.
- Only use `bash` for shell scripting. Include the correct shebang `#!/bin/bash` on all executables. **Reasoning:** Bash is a de-facto standard for scripting, and can be safely assumed to be running on a developer's machine.
- `.sh` file extension is to be omitted for executables, mandatory for shared libs.
- Use Shell scripts to initialise and orchestrate secondary processes.
- Any generally supported scripting language is acceptable in lieu of bash, rule-of-thumb to be used in choosing a scripting language is that it must be supported either natively in Linux/MacOS or be easily installable. Perl/Python are preferred, do not use node.js unless there is a good reason to do so.
- Only use node.js for support scripts if the script requires you follow the existing implementation in the application. i.e. Orchestrating application tasks. If your tasks could instead be automated through the API, do so. Otherwise, use of node.js is acceptable.


## Typescript

### Syntax
- Use hard-tabbing in your IDE. Use leading TABS instead of spaces. **Reasoning:** The individual developer can choose for themselves how to render a TAB literal. If you want it visually represented by 4 spaces, any modern editor can handle this easily. Rendering an arbitrary number of spaces as a different width is generally more unreliable.
- Use JSdoc inline documentation ( http://usejsdoc.org/ ) for functions, and for documenting interface/class members. **Reasoning:** Modern IDE's can interpret these and use them in IntelliSense tooltips.
- Use one line JSdoc comment blocks /** Comment */ for documenting variables. **Reasoning:** Modern IDE's can interpret these annotations and use them in code hints.
- Use JSdoc's @throws annotation to document what exceptions can be thrown from a function.
- If aligning comments on the end of the line, use spaces for padding.
- Use single-quotes when enclosing string literals. **Reasoning:** Requires slightly less effort than double-quotes, and makes no difference to the interpreter.
- Always end statements with semicolons. **No exceptions**.
- Use ES6 template directives wherever appropriate. Use: `string${variable}string`, over: `"string" + variable + "string"`. An exception to this rule is when splitting a string across lines.
- Use ES6 variable declarations only. eg. `let` and `const` instead of `var`.
- Use module headers on all module index files. Use jsdoc format for headers. Use two line breaks after module headers.
- Use `camelCase` for variable, function and method names. `PascalCase` for class names.
- Use two line breaks after the end of a function body before the next symbol.
- In function declarations, place each parameter on a new line. e.g:

```typescript
/**
 * Encabulates...
 * @async
 * @param {number} foo - foo.
 * @param {string} bar - bar.
 * @param {boolean} baz - baz.
 * @returns The encabulated thingy.
 * @throws {SomeError} - When the thingy cannot be reliably encabulated.
 */
export async function retroEncabulate(foo:number,
  bar:string,
  baz:boolean):Promise<Quux>
{
  // ...
}
```


### Methodology
Many of the following are picked up automatically by linting or the Typescript compiler, the following rules act as a very general guide to writing clean code in the project.

- Always err on the side of native solutions to simple problems. Avoid adding the burden of learning unnecessary dependencies to the burden of understanding the codebase.
- Opt for `const` correctness wherever possible. If you don't ever intend for a variable to be changed during the course of program execution, declare it as `const`. This helps code-quality by documenting intent, as well as restricting the possibility for unintended side-effects. Be aware this does not ensure immutability for Objects, use `Object.freeze(...)` for this purpose.
- **Do not**, under _any_ circumstances, write functions that modify by reference. Write pure functions which compute useful values and return them. When passing an object as a parameter, use Typescript's `Readonly<T>` template type as a way to enforce this.
- Write functions that do **one** thing and one thing only. Label them as such.
- Avoid writing functions which accept required parameters as a single object. Use specific arguments wherever possible. e.g use `function(arg1, arg2)` instead of `function({...args})`. Reasoning is that these tend towards being difficult to debug, make error detection difficult, and risk allowing *modify-by-reference* anti-patterns. It might not be immediately obvious to the next person *where* a value inside this object was defined.
- Use interface types to define optional argument objects for functions. e.g:

```typescript
export interface IFunctionOptions {
	/** Some configurable option. */
	optionalArg?:string;

	/** Another option. */
	anotherOptionalArg?:Date;
}


function functionWithOptions(arg1:string,
  arg2:string,
  options:IFunctionOptions = {})
{
  // ...
}

```

- Only use arrow functions for functions in iterator methods like `map`, `forEach` etc. Otherwise use `function` instead. **Reasoning:** The syntax is clearer and easier to read at a glance.
- If functions in Array iterator methods such as `forEach`, `map` and `reduce` are more complex than a few lines, use a named `function` declared at global scope instead of inline arrow functions. **Reasoning:** These are easier to read, as they require less nested indentation. They also don't contribute excess complexity to understanding the parent function.
- Avoid use of function pointers for anything other than Array iterator methods as specified above.
- Wrap any code that can throw specific exceptions in try/catch blocks. If you do not intend to handle the error and resume normal functionality within the calling function, then these are not necessary.
- Try and encapsulate as much simple business logic within the entity classes. This aids in maintainability. **Reasoning:** When changing the business logic of an entity, it might otherwise be difficult to determine where else this business logic was implemented.
- Use `async/await` functionality wherever possible in backend services.
- Never pass data dependencies along the function chain, always retrieve data dependencies at their point of use. If you are unable to do that, you are probably doing something wrong to begin with.
- Only use `Promise.all(...)` on homogeneous input arrays to produce homogeneous results. I.e Multiple invocations of a single `async` function in a parallel fashion. Never use `Promise.all()` to satisfy heterogeneous data dependencies for a function. External data should be retrieved specifically and descriptively labeled. As above, If you are unable do this in a concise manner rethink your approach.


### Testing
- Be sure to clean up any test data you insert during an individual test during teardown. **Reasoning:** These can interfere with subsequent tests, particularly if they are relying on consistent counts for the number of customers/policies/claims. The same applies to †esting stubs.
- Don't rely on static seed data during tests. This can greatly complicate schema refactoring. Use the `testUtils` module to create test data.
- When testing API endpoints for failure cases, you are highly encouraged to test not only the HTTP status code, but the returning result body. **Reasoning:** It is easy for regression errors to sneak by undetected when a failing request in an automated test returns: '400: Request validation error' instead of: '400: Domain specific, meaningful error' without checking the result body explicitly.


## SQL

### Syntax
- Use `snake_case` and singular form for table names to avoid ambiguity. e.g `policy_item` over `policy_items`.
- Always capitalise SQL keywords e.g. `SELECT` or `JOIN`.

### Methodology
- Use `UUID` as a `PRIMARY KEY` type entities wherever possible. Especially those that may be serialised and sent to the front-end. **Reasoning:** This obscures implementation details, and does not expose database size to end-users.
- Do not use triggers as a way to check/maintain referential integrity, use relational constraints instead.
- Observe 3NF in DDL where possible.
- Use the format `table_id` for a table's primary key, and if no other specific name makes more sense, use the same name for referencing it as a foreign key in another table. eg. `user.user_id` is the primary key referenced by `widget.user_id`. **Reasoning:** This makes it easy to understand what field a foreign key references at a glance.
- Use `timestamptz` data type for dates to maintain implementation consistency.
- When naming junction tables, try to use a noun that describes the relationship between the entities. Eg. When joining `person` to `company`, try `employment`.


## Python

## Syntax
- Use `snake_case` for variable and function names.
- Use `pylint` liberally.
- Follow `PEP` guidelines where possible.
- Use four space indents, as per `PEP` guidelines.

### Methodology
- Use Python3 unless there is a specific reason not to, such as lack of library support.
