# Node.js Compatibility Issues and Build System

This document outlines the Node.js compatibility issues encountered with the legacy build system and the solutions implemented to maintain Firefox extension builds.

## Overview

The project uses **Gulp 3.9.1** from 2015, which has compatibility issues with modern Node.js versions. This document serves as a reference for future upgrades when modernizing the build system.

## Root Cause

The core issue is the **"primordials" error** that occurs when running Gulp 3.9.1 on Node.js 12+:

```
ReferenceError: primordials is not defined
```

This happens because:
- Gulp 3.9.1 uses `graceful-fs@1.2.3` and other dependencies that access Node.js internals
- Node.js 12+ moved `primordials` to an internal module, breaking legacy packages
- The project has no version locking, so `npm install` pulls incompatible newer versions

## Issues Encountered and Solutions

### 1. Primordials Error (Node.js 12+)
**Issue**: Gulp 3.9.1 fails on Node.js versions 12 and above
**Solution**: Use Node.js 10.24.1 via wrapper scripts
**Why needed**: Only way to run legacy Gulp 3.9.1 without major rewrites

### 2. Missing Babel Dependencies
**Issue**: `gulpfile.babel.js` requires Babel transpilation support
```
Failed to load external module @babel/register
```
**Solution**: Added missing dependencies:
- `@babel/register@^7.28.3`
- `@babel/core@^7.23.0`
- `@babel/preset-env@^7.23.0`

### 3. Package Version Incompatibilities
**Issue**: Modern package versions use features not available in Node.js 10

#### yargs (17.7.2 → 15.4.1)
```
Error: yargs parser supports a minimum Node.js version of 12
```
**Fix**: Downgraded to v15.4.1, removed `hideBin()` usage

#### del (7.1.0 → 6.1.1)
```
SyntaxError: Unexpected token {
import {promisify} from 'node:util';
```
**Fix**: Downgraded to CommonJS version that doesn't use ES modules

#### gulp-imagemin (8.0.0 → 7.1.0)
```
SyntaxError: Unexpected token {
import {createRequire} from 'node:module';
```
**Fix**: Downgraded to version without ES modules

#### webpack (5.89.0 → 4.46.0)
```
SyntaxError: Unexpected token .
const s={chrome:{releases:...
```
**Fix**: Webpack 5 uses modern JavaScript features; downgraded to 4.46.0

#### babel-loader (9.1.0 → 8.3.0)
```
SyntaxError: Unexpected token .
externalDependencies?.forEach(dep => {
```
**Fix**: Newer babel-loader uses optional chaining; downgraded to 8.3.0

#### sass vs node-sass
```
ReferenceError: globalThis is not defined
```
**Fix**: Replaced `sass` with `node-sass@4.14.1` (globalThis not available in Node 10)

### 4. Deprecated gulp-util
**Issue**: `gulp-util` was removed in Gulp 4, but Gulp 3.9.1 tasks still reference it
**Solution**: Replaced with individual packages:
- `gulp-util.colors` → `ansi-colors@^4.1.3`
- `gulp-util.log` → `fancy-log@^2.0.0`

### 5. Webpack Plugin Changes
**Issue**: `webpack.optimize.UglifyJsPlugin` removed in Webpack 4+
```
TypeError: webpack.optimize.UglifyJsPlugin is not a constructor
```
**Solution**: Added separate `uglifyjs-webpack-plugin@^2.2.0`

### 6. ES6 Module Compatibility
**Issue**: Some task files used ES6 imports incompatible with Node.js 10
**Solution**: Converted to CommonJS:
- `import` → `require()`
- `export default` → `module.exports`

## Wrapper Script System

### Core Wrapper (`node-wrapper.sh`)
Forces Node.js 10.24.1 for any command:
```bash
export PATH="/home/andrei/.ndenv/versions/10.24.1/bin:$PATH"
unset NDENV_VERSION
exec "$@"
```

### Command-Specific Wrappers

#### `npm-old.sh`
```bash
exec ./node-wrapper.sh npm "$@"
```
**Purpose**: Run npm commands with Node 10.24.1

#### `gulp-old.sh`
```bash
exec ./node-wrapper.sh npx gulp "$@"
```
**Purpose**: Run Gulp tasks with Node 10.24.1

#### `node-old.sh`
```bash
exec ./node-wrapper.sh node "$@"
```
**Purpose**: Run Node.js scripts with version 10.24.1

#### `build-firefox.sh`
Complete build pipeline with error handling:
- Validates Node.js version
- Clean dependency installation
- Firefox extension build
- Success/failure reporting

## Build Exclusions

To ensure build wrapper scripts don't end up in the extension package, the following files should be ignored by build processes:

### Files to Exclude from Extension Build:
- `docs/` directory (documentation)
- `build-*.sh` (build scripts)
- `*-old.sh` (wrapper scripts)
- `node-wrapper.sh`
- `.claude/` (development tools)

### Current .gitignore Coverage:
Most build artifacts are already excluded, but documentation and build scripts are intentionally tracked for development reference.

## Future Modernization Path

When upgrading the build system:

### Phase 1: Gulp 4 Migration
1. **Upgrade Gulp**: 3.9.1 → 4.0.2+
2. **Task API Changes**: Replace dependency arrays with `gulp.series()`/`gulp.parallel()`
3. **Remove gulp-util**: Already replaced with individual packages

### Phase 2: Webpack 5 Migration
1. **Upgrade webpack**: 4.46.0 → 5.x
2. **Update loaders**: babel-loader 8.x → 9.x
3. **Configuration changes**: Add `mode` option, update optimization config

### Phase 3: Modern Node.js
1. **Target Node.js 16+ LTS**
2. **Update all packages** to current versions
3. **Remove wrapper scripts**
4. **Enable modern JavaScript features**

### Phase 4: Build System Modernization
Consider alternatives:
- **Vite**: Modern, fast bundler with better defaults
- **esbuild**: Extremely fast JavaScript bundler
- **Rollup**: Optimized for libraries and extensions
- **Webpack 5**: If sticking with webpack

## Testing Compatibility

When modernizing, test with:
```bash
# Current (legacy) build
./build-firefox.sh

# Future (modern) build
npm run build:firefox

# Verify extension packaging
ls -la packages/filter_awesomebar-*.xpi
```

## Notes

- This wrapper system is a **temporary compatibility solution**
- The extension successfully builds with Node 10.24.1 + legacy packages
- Modern development can continue with Node 22+ for other tools
- All build outputs (`dist/`, `packages/`) work correctly
- Firefox extension installs and runs properly

**Remove this entire wrapper system** once the build tools are modernized to current standards.