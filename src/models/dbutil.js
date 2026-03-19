
/*
* Convert DB column name with underscore to property name
* Example:
*   call_type_final_desc -> callTypeFinalDesc
*/
function fromSQLColumnToProperty(str) {
    return str.split('_').map(function (word, index) {
        // first word to lowercase
        if (index == 0) {
            return word.toLowerCase();
        }
        // upper case the first char and lowercase the rest.
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
}

export default fromSQLColumnToProperty;
