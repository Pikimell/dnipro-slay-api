export const parseJSON = (json: string)=>{
    const firstIndex = json.indexOf('{');
    const lastIndex = json.lastIndexOf('}');

    if(firstIndex !== lastIndex){
        const jsonData = json.slice(firstIndex, lastIndex + 1);
        return JSON.parse(jsonData)
    }
}