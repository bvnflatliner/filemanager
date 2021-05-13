import i18next from 'i18next';
// @todo: try to useMemo

export default function useLang(locales, defaultLang) {

	let lang = window.location.pathname.slice(1, 3);
	if (locales[lang] === undefined) {
		lang = defaultLang;
	}

	i18next.init({
		lng: lang,
		resources: locales[lang]
	});

	return lang;
}
