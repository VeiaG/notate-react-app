import React, {useEffect, useRef, useState} from "react";
import './book-page.scss';

import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
import { quotePlugin } from '@mdxeditor/editor/plugins/quote'
import { CodeToggle, CreateLink,  InsertImage, InsertTable, InsertThematicBreak, ListsToggle, Separator, ShowSandpackInfo, codeBlockPlugin, codeMirrorPlugin, diffSourcePlugin, directivesPlugin, imagePlugin, linkDialogPlugin, linkPlugin, sandpackPlugin, tablePlugin, thematicBreakPlugin, useCodeBlockEditorContext } from "@mdxeditor/editor";
import { markdownShortcutPlugin } from "@mdxeditor/editor";

import { UndoRedo } from '@mdxeditor/editor/plugins/toolbar/components/UndoRedo'
import { BoldItalicUnderlineToggles } from '@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles'
import { toolbarPlugin } from '@mdxeditor/editor/plugins/toolbar'
// ------------

import { useDispatch, useSelector } from "react-redux";

import BookPageSidebar from './book-page-sidebar/book-page-sidebar';
import { BlockTypeSelect } from "@mdxeditor/editor";

import {bookItems_set} from '../../../reducers/pageSlice'

import CacheService from "../../../services/CacheService";

import debounce from "lodash.debounce";

const service = new CacheService();



const BookPage = ()=>{
    const currentState = useSelector(state=> state.page.value);
    const editorRef = useRef();
    
    const dispatch = useDispatch();

    const [NoteIndex, setNoteIndex] = useState(undefined);

    const NoteIndexRef = useRef(NoteIndex);

    const curStateRef = useRef(currentState.bookItems);

    useEffect(()=>{
        if(NoteIndex !== undefined){
            editorRef.current.setMarkdown(currentState.bookItems.items[NoteIndex].content);
        }
    },[NoteIndex])

    curStateRef.current = currentState.bookItems;

    const SetNote = (id)=>{
        const noteIndex = currentState.bookItems.items.findIndex(item => item.id === id);
        setNoteIndex(noteIndex);
        NoteIndexRef.current = noteIndex;
        
        
    }

    const refresh = ()=>{
        service.notes_get(currentState.bookItems.id).then(result =>{
            const newBooksItems = {
                ...currentState.bookItems,
                items:result 
            };
            dispatch(bookItems_set(newBooksItems));
            curStateRef.current = newBooksItems;

            setNoteIndex(result.length -1);
            NoteIndexRef.current = result.length -1;
        })
    }

  

    const handleChange = (value )=>{
        const newText = value;
        if(NoteIndexRef.current !== undefined){
            const newNote = { 
                ...curStateRef.current.items[NoteIndexRef.current] ,
                content:newText}
            let newList = [...curStateRef.current.items ];
            console.log('newNote : ',newNote);
            newList[NoteIndexRef.current] = newNote;
            
            service.notes_set( curStateRef.current.id,newList);
            
            dispatch(bookItems_set({
                ...curStateRef.current,
                items: newList
            }));
            curStateRef.current = {
                ...curStateRef.current,
                items: newList
            };
        }
    }

    const TogglePin = (id)=>{
        const index = currentState.bookItems.items.findIndex(item => item.id === id);
        console.log('togle pin id: '+id);
        const newNote = { 
            ...curStateRef.current.items[index] ,
            isPinned: !curStateRef.current.items[index].isPinned}
        let newList = [...curStateRef.current.items ];

        newList[index] = newNote;

        service.notes_set( curStateRef.current.id,newList);
        
        dispatch(bookItems_set({
            ...curStateRef.current,
            items: newList
        }));
        curStateRef.current = {
            ...curStateRef.current,
            items: newList
        };
    }

    const debouncedHandleChange = debounce(handleChange,300);

    return <div className="book-page">
        <BookPageSidebar 
            data={currentState.bookItems} 
            setNote={SetNote}
            refreshList={refresh}
            togglePin={TogglePin}/>
        <div className="book-page__editor">
        {(NoteIndex !== undefined )&& <MDXEditor 
                onChange={debouncedHandleChange}
                ref={editorRef}
                className=" MDEditor"
                markdown={'хуй'}
                
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    linkPlugin(),
                    quotePlugin(),
                    markdownShortcutPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    thematicBreakPlugin(),
                    tablePlugin(),
                    toolbarPlugin({
                        toolbarContents: () => ( <> 
                            <UndoRedo />
                            <Separator/>

                            <BoldItalicUnderlineToggles />
                            <ListsToggle/>
                            <Separator/>

                            <BlockTypeSelect/>
                            <Separator/>

                            <CodeToggle/>
                            <Separator/>

                            <InsertThematicBreak/>
                            <CreateLink/>
                            <InsertImage/>
                            <Separator/>
                            
                            <InsertTable/>


                        </>)
                    })]
                    } />
            }

        </div>
    </div>
}
export default BookPage;