import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RolllStateType } from "shared/models/roll"
import sort_icon from 'assets/images/sort_alpha.png'
import sort_rev_icon from 'assets/images/sort_rev_alpha.png'

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const [sortUp, setSortUp] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [isRollChanged, setIsRollChanged] = useState(false)
  const [isFilterOn , setIsFilterOn] = useState(false)
  const [filterRoll, setFilterRoll] = useState<ItemType>()

  const [saveRoll] = useApi({ url: "save-roll" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    // Sorting by First and Last names
    else if (action === "sort") {
      // console.log("searchMode is", isSearchMode)
      const selectedOption = (document.getElementById("sortBy") as HTMLSelectElement).selectedOptions[0].value

      if (selectedOption === "byFirstName") {
        if (sortUp) {
          data?.students.sort((a, b) => a.first_name > b.first_name ? -1 : 1)
          setSortUp(false)
        }
        else {
          data?.students.sort((a, b) => a.first_name > b.first_name ? 1 : -1)
          setSortUp(true)
        }
      }
      else if (selectedOption === "byLastName") {
        if (sortUp) {
          data?.students.sort((a, b) => a.last_name > b.last_name ? -1 : 1)
          setSortUp(false)
        }
        else {
          data?.students.sort((a, b) => a.last_name > b.last_name ? 1 : -1)
          setSortUp(true)
        }
      }

      // console.log(data?.students)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.currentTarget.value)

    if (!e.currentTarget.value) {
      setIsSearchMode(false)
      return
    }
    
    setIsSearchMode(true)
  }

  type ItemType = RolllStateType | "all"

  const onActiveRollAction = (action: ActiveRollAction, roll?: ItemType) => {
    if (action === "exit") {
      setIsRollMode(false)
      setIsFilterOn(false)
    }

    if (action === "filter") {
      if (!isFilterOn) {
        setIsFilterOn(true)
      }
      setFilterRoll(roll)
    }

    if (action === "save") {
      saveRoll({ student_roll_states: data?.students.map(s => ({ student_id: s.id, roll_state: s.roll === undefined ? "unmark" : s.roll })) })
    }
  }

  const rollChanged = (roll: RolllStateType, student: Person) => {
    setIsRollChanged(true)

    data?.students.forEach(s => {
      if (s.id === student.id) {
        // console.log('roll changed', roll, s.roll)
        s.roll = roll
        return
      }
    })

    if (isRollChanged) {
      setIsRollChanged(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} inputHandle={handleInput} sortUp={sortUp} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && !isSearchMode && !isFilterOn && data?.students && (
          <>
            {data.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={rollChanged} />
            ))}
          </>
        )}
        
        {loadState === "loaded" && isSearchMode && data?.students && (
          <>
            {
              data.students.filter((s) => s.first_name.toLowerCase().includes(searchVal.toLowerCase()) || s.last_name.toLowerCase().includes(searchVal.toLowerCase()))
                .map(s => (
                  <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={rollChanged} />
                ))
            }
          </>
        )}

        {loadState === "loaded" && isFilterOn && isRollMode && data?.students && (
          <>
            {
              filterRoll === "all" ?
                data.students.map((s) => (
                  <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={rollChanged} />
                ))
                :
                data.students.filter(s => s.roll === filterRoll)
                  .map((s) => (
                  <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollChange={rollChanged} />
                ))
            }
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} totalStudents={data?.students ? data.students : []} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  inputHandle: (action: React.ChangeEvent<HTMLInputElement>, value?: string) => void
  sortUp: boolean
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, inputHandle, sortUp } = props

  return (
    <S.ToolbarContainer>
      <div>
        <select id="sortBy">
          <option value="byFirstName">By First Name</option>
          <option value="byLastName">By Last Name</option>
        </select>
        <S.Button onClick={() => onItemClick("sort")}>
          { !sortUp && <img src={sort_icon} alt="sort_alpha icon" style={{ width: '1em', height: '1em', background: '#fff', padding: '.5em', borderRadius: '.5em', boxShadow: '.2em -.2em gray' }} /> }
          { sortUp && <img src={sort_rev_icon} alt="sort_rev_alpha icon" style={{ width: '1em', height: '1em', background: '#fff', padding: '.5em', borderRadius: '.5em', boxShadow: '.2em -.2em gray' }} /> }
        </S.Button>
      </div>
      <div>
        <input id="searchSpace" type="text" placeholder="Search" onInput={inputHandle} />
      </div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
