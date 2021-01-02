const reducer = (state, action) => {
    switch(action.type) {
        case 'SUCCESS':
            return '';
        case 'BLANK':
            return 'Field tidak boleh kosong';
        default:
            return state;
    }
}

export default reducer;