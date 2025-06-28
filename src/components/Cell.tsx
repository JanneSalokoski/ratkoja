import { useEffect, useRef } from 'react'

import "./Cell.css";

interface CellProps {
    letter: string;
    index: number;
    active: boolean;
    selected: boolean;
    disabled: boolean;
    startsGroups: number[];
    clickHandler: (index: number, e: React.MouseEvent) => void;
    keyPressHandler: (index: number, e: React.KeyboardEvent) => void;
}

export function Cell(props: CellProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.active) {
            inputRef.current?.focus();
        }
    }, [props.active]);

    return (
        <div
            tabIndex={props.index}
            className={
                `Cell ${props.active ? "active" : ""}
                ${props.selected ? "selected" : ""}
                ${props.disabled ? "disabled" : ""}
                `
            }
            onClick={(e: React.MouseEvent) => {
                inputRef.current?.focus();
                props.clickHandler(props.index, e);
            }}
        >
            <span className="groups">
                {
                    props.startsGroups.join(",")
                }
            </span>
            <span className="letter">
                {props.letter}
            </span>
            <input className="hidden-input"
                ref={inputRef}
                type="text"
                maxLength={1}
                value={props.letter}
                onKeyUp={(e: React.KeyboardEvent) => props.keyPressHandler(props.index, e)}
                onChange={() => { }}
                autoFocus={props.active}
                autoCapitalize="characters"
                inputMode="text"
            />
        </div>
    )
}
