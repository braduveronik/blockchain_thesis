import React from "react";
const { dialog } = window.require('electron').remote;


export default function FilePicker(props) {

    const [fileLocation, setFileLocation] = React.useState(null);

    const doBrowse = async function(e) {
        const res = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
        if(!res.canceled) {
            setFileLocation(res.filePaths[0]);
            props.File(res.filePaths[0]);
            return;
        }
        setFileLocation('Select an wallet');
    }

    const fileLocationOnChange = function(e) {
        setFileLocation(e.target.value);
    }
    
    return (
        <div className="custom custom-file">
            <input id="custom-file"  style={{cursor: 'default'}} type="text" onChange={fileLocationOnChange} onClick={doBrowse} className="custom-file-input"/>
            <label htmlFor="custom-file" className="custom-file-label">{fileLocation}</label>
        </div>
    );
}