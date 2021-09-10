const fs = require('fs-extra');
const test = require('ava');
const path = require('path');

const filesJsonSchema = require('../files.schema.json');
const {
  templateJsonSchema,
  templateJsonSchemaWithFiles,
} = require('../generate-schemas');

test('templateJsonSchema correctly updates schema template', (t) => {
  const schemaTemplatePath = path.join(__dirname, 'fake-schema-template.json');
  const schemaOutputPath = path.join(__dirname, 'fake-schema-output.json');
  fs.writeFileSync(
    schemaTemplatePath,
    JSON.stringify({
      foo: '{{ foo }}',
    })
  );
  const replacements = {
    foo: 'bar',
  };
  templateJsonSchema(
    schemaTemplatePath,
    schemaOutputPath,
    replacements
  );
  const schemaOutput = fs.readFileSync(schemaOutputPath, 'utf-8');
  t.deepEqual(schemaOutput, JSON.stringify({ foo: 'bar' }));
});

test('templateJsonSchemaWithFiles correctly inserts file schema to template', (t) => {
  const schemaTemplatePath = path.join(__dirname, 'fake-schema-template.json');
  const schemaOutputPath = path.join(__dirname, 'fake-schema-output.json');
  fs.writeFileSync(
    schemaTemplatePath,
    JSON.stringify({
      files: '{{files}}',
    })
  );
  templateJsonSchemaWithFiles(
    schemaTemplatePath,
    schemaOutputPath
  );
  const schemaOutput = fs.readFileSync(schemaOutputPath, 'utf-8');
  t.deepEqual(schemaOutput, JSON.stringify({ files: filesJsonSchema }));
});