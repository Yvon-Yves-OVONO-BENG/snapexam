module.exports = function (plop) {
  // Générateur de composant
  plop.setGenerator('component', {
    description: 'Créer un composant React',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Nom du composant ?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}.js',
        templateFile: 'plop-templates/component.hbs',
      },
    ],
  });
};
