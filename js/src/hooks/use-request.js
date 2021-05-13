import { useReducer } from 'react';

import useDeepEffect from './use-deep-effect';

const reducer = (oldState, newState) => ({ ...oldState, ...newState });

export default function useRequest({ request, payload }) {

	const initialState = {
		loading: true,
		error: null,
		data: null,
		total: 0
	};

	const [ state, setState ] = useReducer(reducer, initialState);

	useDeepEffect(() => {

		setState({ loading: true, error: null });
		request(payload)
			.then(response => {

				const responseData = response.data;

				if (responseData.status === 'ok') {
					const { data } = responseData;
					const total = responseData.total ? responseData.total : data.length;

					// @todo: if we add schema, parse data here

					setState({ loading: false, data, total });
				} else {
					setState({ loading: false, error: responseData.msg ? responseData.msg : 'Unknown error', data: null, total: 0 });
				}
			})
			.catch(error => {
				setState({ loading: false, error: error.message, data: null, total: 0 });
			});
	}, [
		request,
		payload
	]);

	return state;
}
