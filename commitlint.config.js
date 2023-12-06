module.exports = {
	parserPreset: 'conventional-changelog-conventionalcommits',
	rules: {
		'body-leading-blank': [1, 'always'],
		'body-max-line-length': [1, 'always', 100],
		'footer-leading-blank': [1, 'always'],
		'footer-max-line-length': [0, 'always', 100],
		'header-max-length': [0, 'always', 100],
		'scope-case': [0, 'always', 'lower-case'],
		'subject-case': [
			0,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case']
		],
		'scope-empty': [1, 'never'],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'type-enum': [
			2,
			'always',
			[
				'docs',
				'build',
				'feat',
				'fix',
        'perf',
				'refactor',
				'revert',
				'style',
				'test'
			]
		]
	}
};
