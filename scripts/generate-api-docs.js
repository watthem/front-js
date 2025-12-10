const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const packages = [
  {
    name: 'core',
    path: 'packages/core/src',
    functions: [
      { name: 'val', file: 'core/reactivity.js' },
      { name: 'run', file: 'core/reactivity.js' },
      { name: 'calc', file: 'core/reactivity.js' },
      { name: 'html', file: 'core/renderer.js' },
      { name: 'render', file: 'core/renderer.js' },
      { name: 'register', file: 'core/client.js' },
      { name: 'hydrate', file: 'core/client.js' },
      { name: 'defineComponent', file: 'core/component.js' }
    ]
  },
  {
    name: 'actions',
    path: 'packages/actions/src',
    functions: [
      { name: 'createClient', file: 'client.js' },
      { name: 'createRouter', file: 'server.js' }
    ]
  }
];

async function generateDocs() {
  for (const pkg of packages) {
    const outputDir = `website/docs/api/${pkg.name}`;
    fs.mkdirSync(outputDir, { recursive: true });

    for (const fn of pkg.functions) {
      const inputFile = path.join(pkg.path, fn.file);
      const output = await jsdoc2md.render({
        files: inputFile,
        'heading-depth': 2,
        'no-gfm': false
      });

      const outputFile = path.join(outputDir, `${fn.name}.md`);
      fs.writeFileSync(outputFile, output);
      console.log(`✅ Generated ${outputFile}`);
    }

    // Generate index
    const indexContent = `# @frontjs/${pkg.name} API Reference

${pkg.functions.map(fn => `- [${fn.name}](./${fn.name}.md)`).join('\n')}
`;
    fs.writeFileSync(path.join(outputDir, 'index.md'), indexContent);
  }

  console.log('✅ API documentation generated!');
}

generateDocs().catch(console.error);
