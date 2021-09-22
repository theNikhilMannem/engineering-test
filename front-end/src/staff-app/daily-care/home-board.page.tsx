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

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const [sortUp, setSortUp] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchVal, setSearchVal] = useState('')

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

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} inputHandle={handleInput} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && !isSearchMode && data?.students && (
          <>
            {data.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}
        
        {loadState === "loaded" && isSearchMode && data?.students && (
          <>
            {
              data.students.filter((s) => s.first_name.toLowerCase().includes(searchVal.toLowerCase()) || s.last_name.toLowerCase().includes(searchVal.toLowerCase()))
                .map(s => (
                  <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
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
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  inputHandle: (action: React.ChangeEvent<HTMLInputElement>, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, inputHandle } = props

  return (
    <S.ToolbarContainer>
      <div>
        <select id="sortBy">
          <option value="byFirstName">By First Name</option>
          <option value="byLastName">By Last Name</option>
        </select>
        <S.Button onClick={() => onItemClick("sort")}> [SORT] </S.Button>
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
