// Entrypoint and primary API
type createChecker = (rules: Rule[]) => (dependency: Dependency) => CheckResult?;

// A rule for the checker to use to validate the specifiers in dependencies.
//
// Rules cover source files that are making the import and target files that
// are being imported.
type Rule = {
  // source modules that are making the imports
  source: Glob;

  // target modules that are being imported
  target: Glob;

  // the style of specifier the import must be made with
  specifier: Specifier;

  // the index of the capture in both source and target patterns that must be
  // equal for this rule to apply
  //
  // starts from 0
  ?boundary: Number;
};

// This is the list of all the supported specifiers.
//
// See https://nodejs.org/api/esm.html#esm_terminology for definitions of the
// absolute, relative, and bare specifiers.
type Specifier = (
  AbsoluteSpecifier |
  AnySpecifier |
  BareSpecifier |
  PackageSpecifier |
  RelativeSpecifier
);

// Absolute specifiers like 'file:///opt/nodejs/config.js'. Scheme is not
// significant.
type AbsoluteSpecifier = ["absolute", {}];

// Matches any specifier. Use when you don't care about the style but only
// want to allow access.
type AnySpecifier = ["any", {}];

// Bare specifiers like 'some-package' or 'some-package/shuffle'. This style
// is likely helpful only for things like aliases or modules that are _not_
// packaged but still may be accessed using a bare specifier.
//
// If you're looking to enforce the use of a package, consider using the
// specialized "package" specifier.
type BareSpecifier = ["bare", {}];

// Package specifiers are a special case of bare specifiers where they must
// point to a module provided by a package. The plugin will look for the nearest
// package.json that has a {"name"} property that matches the name in the
// specifier, similar to the Node.js algorithm.
type PackageSpecifier = ["package", {
  // Resolve the package.json from disk. The default routine is described above,
  // the return value must be a tuple of the package.json filepath next to the
  // actual exports of that file.
  ?resolve: (cursor: Pathname) => Array.<Pathname, Object>;

  // Expand the path of the target into an absolute filepath. This is only
  // necessary if the target path is relative, as this specifier has no notion
  // of a context directory.
  //
  // Absolute path is necessary to correctly resolve the package.json on disk.
  ?expand: (file: Pathname) => Pathname;
}];

// Relative specifiers like './startup.js' or '../config.mjs'. A popular
// choice for inter-related code, like packages.
type RelativeSpecifier = ["relative", {}];

// This is the input you want to validate using the checker instance you created
type Dependency = {
  // source file that is importing
  source: Pathname;

  // target file that is being imported
  target: Pathname;

  // the import specifier (like "./foo" or "some-foo/bar.js")
  request: String;
};

// The result you get from checking a dependency.
type CheckResult = [
  // whether a rule was found and the specifier passed the check
  ?Boolean,

  // index of the matching rule
  ?Number,
];
