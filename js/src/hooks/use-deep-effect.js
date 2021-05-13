import { useEffect, useRef } from 'react';

import { isEqual } from 'lodash';

function useDeepCompareMemoize(value) {
	const ref = useRef();

	if (!isEqual(value, ref.current)) {
		ref.current = value;
	}

	return ref.current;
}

export default function useDeepEffect(callback, deps) {
	useEffect(callback, useDeepCompareMemoize(deps));
}
