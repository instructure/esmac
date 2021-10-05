## 3.0.0

- rule specifier's output is no longer produced nor forwarded as it was hardly
  useful and made implementation details harder to change
- `package` specifier no longer provides the path or the exports of the
  `package.json` that was resolved for the target
- `package` specifier now performs an implicit `bare` check, which shouldn't
  have an effect on the existing behavior

## 2.0.0

- `package` specifier now continues to attempt to resolve a package.json until
  one is found with the name found in the specifier. Previously, it would stop
  as soon as it encountered a package.json that has a name and caused it to
  incorrectly forward that package.json as an output even though it would
  fail the check.

## 1.0.0

Initial release with support for relative, bare, package and absolute
specifiers.
