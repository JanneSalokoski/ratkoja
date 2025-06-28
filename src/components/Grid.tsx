import { useEffect, useState, useMemo } from 'react'

import { Cell } from './Cell';

import "./Grid.css";

enum SelectionDirection {
    Horizontal,
    Vertical,
}

interface GridProps {
    disabling: boolean;
    gridSize: number;
    handleKnown: (newKnown: string[]) => void
    handleGroupSelect: (newSelectedGroup: any) => void
}

export function Grid(props: GridProps) {
    let [letters, setLetters] = useState<(string)[]>(new Array(props.gridSize * props.gridSize).fill(""));
    useEffect(() => {
        setLetters(new Array(props.gridSize * props.gridSize).fill(""));
    }, [props.gridSize]);

    console.log(letters.length);
    let [active, setActive] = useState<number | undefined>();
    let [selectedRow, setSelectedRow] = useState<number | undefined>();
    let [selectedCol, setSelectedCol] = useState<number | undefined>();
    let [selectionDirection, setSelectionDirection] = useState<SelectionDirection>(SelectionDirection.Horizontal);
    let [disabled, setDisabled] = useState<number[]>([]);
    useEffect(() => {
        setDisabled([]);
    }, [props.gridSize]);

    let [groups, setGroups] = useState<number[][]>([]);

    useEffect(() => {
        let rowGroups: number[][] = [];
        let colGroups: number[][] = [];
        // rows
        let startNewRow = true;
        let startNewCol = true;
        for (let row = 0; row < props.gridSize; row++) {
            for (let col = 0; col < props.gridSize; col++) {
                if (startNewRow) {
                    rowGroups.push([]);
                }

                if (startNewCol) {
                    colGroups.push([]);
                }

                let rowIndex = row * props.gridSize + col;
                if (!disabled.includes(rowIndex)) {
                    startNewRow = false;
                    rowGroups[rowGroups.length - 1].push(rowIndex)
                } else {
                    startNewRow = true;
                }

                let colIndex = col * props.gridSize + row;
                if (!disabled.includes(colIndex)) {
                    startNewCol = false;
                    colGroups[colGroups.length - 1].push(colIndex)
                } else {
                    startNewCol = true;
                }

                if (col === props.gridSize - 1) {
                    startNewRow = true;
                }
            }
            startNewCol = true
        }

        let newGroups = rowGroups.concat(colGroups).filter((x) => x.length > 2);
        setGroups(newGroups);

    }, [disabled]);

    function updateSelectedGroup(index: number) {
        const matchingGroups = groups.filter(group => group.includes(index));

        let targetGroup = matchingGroups.find(group => {
            const start = group[0];
            const end = group[group.length - 1];

            if (selectionDirection === SelectionDirection.Horizontal) {
                return Math.floor(start / props.gridSize) === Math.floor(end / props.gridSize); // same row
            } else {
                return start % props.gridSize === end % props.gridSize; // same column
            }
        });

        if (targetGroup) {
            props.handleGroupSelect(groups.indexOf(targetGroup));
        } else {
            // props.handleGroupSelect(-1); // nothing selected
        }
    }


    useEffect(() => {
        let known: string[] = [];

        for (let group of groups) {
            let knownWord = "";
            for (let idx of group) {
                if (letters[idx] !== "") {
                    knownWord += letters[idx]
                } else {
                    knownWord += "."
                }
            }

            known.push(knownWord);
        }

        props.handleKnown(known);
    }, [groups, letters])

    useEffect(() => {
        if (active !== undefined) {
            updateSelectedGroup(active);
        }
    }, [selectionDirection]);


    function handleClick(index: number, _: React.MouseEvent) {
        if (!props.disabling) {
            if (active === index) {
                setSelectionDirection(selectionDirection === SelectionDirection.Vertical ? SelectionDirection.Horizontal : SelectionDirection.Vertical)
            } else {
                setActive(index);
            }

            const row = Math.floor(index / props.gridSize);
            setSelectedRow(row);

            const col = index % props.gridSize;
            setSelectedCol(col);

            updateSelectedGroup(index);

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
        e.preventDefault();
        e.stopPropagation();

        if (active !== undefined) {
            const index = active;
            const newChar = e.key === "Backspace" ? "" : e.key.toUpperCase();

            const directionDelta = selectionDirection === SelectionDirection.Horizontal ? 1 : props.gridSize;
            const offset = newChar === "" ? -directionDelta : directionDelta;

            let newIndex = index + offset;

            if (selectionDirection === SelectionDirection.Horizontal) {
                const currentRow = Math.floor(index / props.gridSize);
                const targetRow = Math.floor(newIndex / props.gridSize);
                if (targetRow !== currentRow || newIndex < 0 || newIndex >= props.gridSize * props.gridSize) {
                    newIndex = index;
                }
            } else {
                if (newIndex < 0 || newIndex >= props.gridSize * props.gridSize) {
                    newIndex = index;
                }
            }

            let newLetters = [...letters];
            newLetters[index] = newChar;

            setLetters(newLetters);
            setActive(newIndex);

            updateSelectedGroup(index);

            if (disabled.includes(newIndex)) {
                setActive(undefined);
            }
        }
    }

    const startsGroupsForIndex = useMemo(() => {
        return letters.map((_, index) =>
            groups
                .map((group, idx) => ({ group, idx }))
                .filter(({ group }) => group[0] === index)
                .map(({ idx }) => idx + 1)
        );
    }, [groups, letters])

    return (
        <div className="Grid" style={{ "--grid-size": props.gridSize } as React.CSSProperties}>
            {letters.map((letter, index) => {
                const row = Math.floor(index / props.gridSize);
                const col = index % props.gridSize;

                return (<Cell
                    index={index}
                    letter={letter}
                    active={active == index}
                    selected={selectionDirection === SelectionDirection.Horizontal && selectedRow === row || selectionDirection === SelectionDirection.Vertical && selectedCol === col}
                    disabled={disabled.includes(index)}
                    clickHandler={handleClick}
                    keyPressHandler={handleKeyPress}
                    startsGroups={startsGroupsForIndex[index]}
                />
                )
            })
            }
        </div>
    )
}
