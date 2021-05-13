import axios from 'axios';

const http = axios.create({
	baseURL: '//filemanager.loc'
});

// helper to prepare params for post request
function params(data) {
	const res = new URLSearchParams();
	Object.keys(data).forEach(key => {
		res.append(key, data[key]);
	});

	return res;
}

// special helper to prepare files as FormData for post request
function filesParams(data) {
	const res = new FormData();
	data.forEach(file => {
		res.append('files[]', file);
	});

	return res;
}

const api = {

	tree() {
		return http.get('/api/tree');
	},
	dir(data) {
		return http.post('/api/dir', params(data));
	},
	upload(data, path) {
		const args = filesParams(data);
		args.append('path', path);
		return http.post('/api/upload', args);
	},
	newfolder(data) {
		return http.get('/api/newfolder', { params: data });
	},
	file(data) {
		return http.get('/api/file', { params: data });
	},
	copy(data) {
		return http.post('/api/copy', params(data));
	},
	rename(data) {
		return http.post('/api/rename', params(data));
	},
	delete(data) {
		return http.post('/api/delete', params(data));
	}

};

export { api as default };
