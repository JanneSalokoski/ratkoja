import { useEffect, useState } from 'react'
import './App.css'

import { Grid } from './components/Grid';
import { Candidates } from './components/Candidates';

function App() {
    let [disabling, setDisabling] = useState<boolean>(false);

    function handleSelect(_: React.ChangeEvent) {
        setDisabling(!disabling);
    }

    function keyUpHandler(e: React.KeyboardEvent) {
        if (e.key.toLowerCase() == "d") {
            setDisabling(!disabling);
        }
    }

    let [known, setKnown] = useState<string[]>([]);
    function knownHandler(newKnown: string[]) {
        setKnown(newKnown);
    }

    let [words, setWords] = useState<string[]>([]);

    let [gridSize, setGridSize] = useState<number>(5);

    useEffect(() => {
        fetch("/words/finnish.txt")
            .then((res) => res.text())
            .then((text) => {
                const newWords = text
                    .split("\n")
                    .map(word => word.trim())
                    .filter(Boolean);

                setWords(newWords.filter(word => word.length <= gridSize));
            })
    }, [gridSize]);

    let [selectedGroup, setSelectedGroup] = useState<number>(0);

    function groupSelectHandler(newSelectedGroup: number) {
        setSelectedGroup(newSelectedGroup);
    }

    return (
        <div className="App" tabIndex={-1} onKeyUp={keyUpHandler}>
            <div className="Header">
                <h1>Ratkoja</h1>
            </div>
            <div className="Controls">
                <label htmlFor="disabling">
                    Disabling:
                    <input type="checkbox"
                        id="disabling"
                        onChange={handleSelect}
                        checked={disabling}
                    />
                </label>
                <label htmlFor="gridSize">
                    Grid size:
                    <input type="number" id="gridSize" min={0} max={100} step={1} value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} />
                </label>
            </div>
            <Grid disabling={disabling} handleKnown={knownHandler} handleGroupSelect={groupSelectHandler} gridSize={gridSize} />

            <Candidates known={known} words={words} selected={selectedGroup} />
            <div className="Footer">
                (c) Janne Salokoski 2025
            </div>
        </div>
    )
}

export default App
