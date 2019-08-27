import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)

main = Browser.sandbox{ init = init, update = update, view = view}

type alias Model = { draft: String, posts: List String }

init : Model
init = { draft = "", posts = ["hi"] }

type Msg
    = Draft String
    | Post

update : Msg -> Model -> Model
update msg model =
    case msg of
        Post ->
            { model | posts = model.draft :: model.posts }
        Draft draft ->
            { model | draft = draft }

view : Model -> Html Msg
view model =
    div []
        [
            Html.node "link" [ Html.Attributes.rel "stylesheet", Html.Attributes.href "style.css" ] []
            , h1 [] [text "Posts"]
            , div [] [ renderPosts model.posts ]
            , hr [] []
            , footer [class "footer"] [
                  input [type_ "text",  onInput Draft] []
                , button [class "fab", type_ "submit", onClick Post] [text "post"]
            ]
        ]



renderPosts : List String -> Html Msg
renderPosts posts =
    posts |> List.map (\p -> div [] [text p]) |> div []