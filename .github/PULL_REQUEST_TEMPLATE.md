## Description

<!-- Provide a brief summary of your changes -->

## Related Issue

<!-- Link to related issue(s) if applicable -->
Fixes #

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Test addition or update

## Checklist

### Code Quality
- [ ] My code follows the project's code style guidelines
- [ ] I have added JSDoc comments for new public APIs
- [ ] I have kept functions small and focused
- [ ] Error handling is graceful and non-fatal

### Testing
- [ ] I have run `npm test` and all tests pass
- [ ] I have tested manually with the examples (Todo app, etc.)
- [ ] I have added/updated tests for my changes
- [ ] XSS protection test passes (if applicable)

### Bundle Size
- [ ] I have run `npm run size-check` and the bundle stays under 5KB
- [ ] If adding features, I considered removing or optimizing existing code

### Documentation
- [ ] I have updated the README (if applicable)
- [ ] I have updated `wiki/API.md` (if applicable)
- [ ] I have updated `docs/BLUEPRINT.md` for architectural changes
- [ ] I have verified alignment with `wiki/STANDARDS.md`

### Security
- [ ] My changes do not introduce `eval()` or `new Function()`
- [ ] All user input is validated
- [ ] User content is properly escaped (via uhtml)
- [ ] No server closures or function serialization

### Deployment
- [ ] My changes work on both root domain and sub-path deployments
- [ ] I have tested locally with `npx serve`
- [ ] Relative paths are used (no hardcoded absolute paths starting with `/`)

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->
