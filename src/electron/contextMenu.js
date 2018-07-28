
module.export = [
    {role:'copy'},
    {role:'paste'},
    { type: 'separator' },
    {role:'undo'},
    {role:'redo'}
]

/*
module.export = [
    {
        label: 'Edit',
        submenu: [
            { 
                label: 'Undo', 
                accelerator: 'CmdOrCtrl+Z', 
                selector: 'undo:' 
            },
            { 
                label: 'Redo', 
                accelerator: 'Shift+CmdOrCtrl+Z', 
                selector: 'redo:' 
            },
            { type: 'separator' },
            { 
                label: 'Cut', 
                accelerator: 'CmdOrCtrl+X', 
                selector: 'cut:' 
            },
            { 
                label: 'Copy', 
                accelerator: 'CmdOrCtrl+C', 
                selector: 'copy:' 
            },
            { 
                label: 'Paste', 
                accelerator: 'CmdOrCtrl+V', 
                selector: 'paste:' 
            },
            { type: 'separator' },
            { 
                label: 'Select All', 
                accelerator: 'CmdOrCtrl+A', 
                selector: 'selectAll:' 
            }
        ]
    }
]; 
*/

/* 
export const editMenuTemplate: any = {
    label: 'Edit',
    submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { type: 'separator' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]
};
*/
