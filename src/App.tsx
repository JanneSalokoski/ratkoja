import { useState } from 'react'
import './App.css'

interface CellProps {
    letter: string;
    index: number;
    active: boolean;
    selected: boolean;
    disabled: boolean;
    clickHandler: (index: number, e: React.MouseEvent) => void;
    keyPressHandler: (index: number, e: React.KeyboardEvent) => void;
}

function Cell(props: CellProps) {
    return (
        <div
            tabIndex={props.index}
            className={
                `Cell ${props.active ? "active" : ""}
                ${props.selected ? "selected" : ""}
                ${props.disabled ? "disabled" : ""}
                `
            }
            onClick={(e: React.MouseEvent) => props.clickHandler(props.index, e)}
            onKeyUp={(e: React.KeyboardEvent) => props.keyPressHandler(props.index, e)}
        >
            <span className="letter">{props.letter}</span>
        </div>
    )
}

enum SelectionDirection {
    Horizontal,
    Vertical,
}

interface GridProps {
    disabling: boolean
}

function Grid(props: GridProps) {
    let [letters, setLetters] = useState<(string)[]>(new Array(25).fill(""));
    let [active, setActive] = useState<number | undefined>();
    let [selectedRow, setSelectedRow] = useState<number | undefined>();
    let [selectedCol, setSelectedCol] = useState<number | undefined>();
    let [selectionDirection, setSelectionDirection] = useState<SelectionDirection>(SelectionDirection.Horizontal);
    let [disabled, setDisabled] = useState<number[]>([]);

    function handleClick(index: number, _: React.MouseEvent) {
        if (!props.disabling) {
            if (active === index) {
                setSelectionDirection(selectionDirection === SelectionDirection.Vertical ? SelectionDirection.Horizontal : SelectionDirection.Vertical)
            } else {
                setActive(index);
            }

            const row = Math.floor(index / 5);
            setSelectedRow(row);

            const col = index % 5;
            setSelectedCol(col);
        } else {
            console.log(disabled);
            if (!disabled.includes(index)) {
                let newDisabled = [...disabled, index];
                setDisabled(newDisabled);
            }
            else {
                let newDisabled = disabled.filter((x: number) => x !== index);
                setDisabled(newDisabled);
            }
        }
    }

    function handleKeyPress(_: number, e: React.KeyboardEvent) {
        if (active !== undefined) {
            const index = active;
            const newChar = e.key === "Backspace" ? "" : e.key.toUpperCase();

            const directionDelta = selectionDirection === SelectionDirection.Horizontal ? 1 : 5;
            const offset = newChar === "" ? -directionDelta : directionDelta;

            let newIndex = index + offset;

            if (selectionDirection === SelectionDirection.Horizontal) {
                const currentRow = Math.floor(index / 5);
                const targetRow = Math.floor(newIndex / 5);
                if (targetRow !== currentRow || newIndex < 0 || newIndex >= 25) {
                    newIndex = index;
                }
            } else {
                if (newIndex < 0 || newIndex >= 25) {
                    newIndex = index;
                }
            }

            let newLetters = [...letters];
            newLetters[index] = newChar;

            setLetters(newLetters);
            setActive(newIndex);

            if (disabled.includes(newIndex)) {
                setActive(undefined);
            }
        }
    }

    return (
        <div className="Grid">
            {letters.map((letter, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;

                return (<Cell
                    index={index}
                    letter={letter}
                    active={active == index}
                    selected={selectionDirection === SelectionDirection.Horizontal && selectedRow === row || selectionDirection === SelectionDirection.Vertical && selectedCol === col}
                    disabled={disabled.includes(index)}
                    clickHandler={handleClick}
                    keyPressHandler={handleKeyPress}
                />
                )
            })
            }
        </div>
    )
}

function App() {
    let [disabling, setDisabling] = useState<boolean>(false);

    function handleSelect(_: React.ChangeEvent) {
        setDisabling(!disabling);
    }

    return (
        <div className="App">
            <Grid disabling={disabling} />
            <div className="Controls">
                <label htmlFor="disabling">
                    Disabling:
                    <input type="checkbox"
                        id="disabling"
                        onChange={handleSelect}
                    />
                </label>
            </div>
        </div>
    )
}

export default App
