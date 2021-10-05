# es-module access control

Control access to modules and enforce the style of specifiers that they may use
to import each other based on their location.

esmac is a Node.js library that helps keep things under control in large trees
by restricting access where needed.

## Motivation

Working in a large codebase with thousands of modules, it helps to group them
into layers where access between them can be made predictable. Gating access
helps you assess the impact of a change you're making; you can, for example,
tell who exactly will be affected by a change, which is very desirable.

It is not unlike access control in programming languages. Consider the number of
times you wished for private variable visibility in JavaScript and instead had
to resort to factory patterns merely for the benefit of access protection?

This is access protection but for files.

Programmers also habitually violate access patterns when they can, because
they're practical beings and I find it hard to blame them, especially when the
alternative usually requires one to think. /s This is especially true in older
systems where nothing stops you from importing any specific module regardless of
where it is. This tool helps break that habit.

Authoritarianism is not the goal. The goal is a more pleasant system where one
can make deliberate, well-informed decisions on where code should go and have
the peace of mind that a change cannot leak.

## Example

esmac lets us control exactly who may access modules and how. Consider the
following file tree:

    .
    ├── lib
    │   ├── bar
    │   └── foo
    └── packages
        ├── a
        ├── b
        └── c

We will be making `lib/` private where package modules aren't able to access it.
Files under `lib/` import each other using relative specifiers. For `packages/`,
files of a single package also import each other using relative specifiers,
while inter-package imports (and lib -> packages) are done using bare
specifiers.

Permit files under `lib/` to access other files under `lib/` and no one else:

    [
      {
        source: "lib/**",
        target: "lib/**",
        specifier: require("esmac/specifiers/relative")
      }
    ]

This also means that `lib/` cannot access `packages/` anymore. To allow that, we
can add another edge, going from `lib/` to `packages/` this time:

    (2)
    [
      ...,
      {
        source: "lib/**",
        target: "packages/**",
        specifier: require("esmac/specifiers/package")
      }
    ]

Third, ensure that modules of a single package import other modules of that
*same* package using only relative specifiers:

    (3)
    [
      ...,
      {
        source: "packages/*/**",
        target: "packages/*/**",
        boundary: 0,
        specifier: require("esmac/specifiers/relative")
      }
    ]

The boundary property for the rule qualifies it to apply only when the captures
of both the source and the target at the specified index are equal. Effectively,
this tells esmac to apply the rule only when both source and target share the
same folder directly under `packages/`:

    { source: 'packages/a/lib/a.js', target: 'packages/a/lib/b.js' } // OK
                        ^                              ^
    { source: 'packages/a/lib/a.js', target: 'packages/b/lib/a.js' } // NOT ok
                        ^                              ^

Finally, to allow access between modules of different packages, we can adopt a
rule similar to what we did for `lib/`:

    (4)
    [
      ...,
      {
        source: "**",
        target: "packages/**",
        specifier: require("esmac/specifiers/package")
      }
    ]

This does make rule (2) superfluous and can be dropped. With this, the full list
of rules becomes:

    [
      {
        source: "lib/**",
        target: "lib/**",
        specifier: require("esmac/specifiers/relative")
      },
      {
        source: "packages/*/**",
        target: "packages/*/**",
        boundary: 0,
        specifier: require("esmac/specifiers/relative")
      },
      {
        source: "**",
        target: "packages/**",
        specifier: require("esmac/specifiers/package")
      }
    ]

Note that order matters. Rules are considered in the order they are given, so
you should order them by specificity.

## API

Signature:

    (Array.<Rule>): (Dependency): CheckResult?

Creates an instance of the checker which gives you a function to validate a
dependency. The function finds the first applicable rule and checks whether the
input's specifier matches the one described by the rule.

See [`./types.d.ts`](./types.d.ts) for an explanation of the relevant types.

## API example

```javascript
const esmac = require('esmac')
const relative = require('esmac/specifiers/relative')

const check = esmac([
  {
    source: 'lib/**',
    target: 'lib/**',
    specifier: relative
  }
])

// rule matches and specifier check passes:
check({
  source: 'lib/a.js',
  target: 'lib/b.js',
  request: './b'
}) // => [true, 0, {}]

// rule matches but specifier check does not pass:
check({
  source: 'lib/a.js',
  target: 'lib/b.js',
  request: 'b'
}) // => [false, 0, {}]

// no applicable rule found:
check({
  source: 'lib/a.js',
  target: 'packages/foo/lib/index.js',
  request: 'foo'
}) // => null
```

## License

MIT