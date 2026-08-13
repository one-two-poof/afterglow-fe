import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlaceCard } from "./PlaceCard";

describe("PlaceCard", () => {
  it("이름·주소·카테고리를 렌더한다", () => {
    render(
      <PlaceCard
        name="도미인 서울 강남"
        address="서울 서초구 강남대로 415"
        category="피부과"
      />,
    );
    expect(screen.getByText("도미인 서울 강남")).toBeInTheDocument();
    expect(screen.getByText("서울 서초구 강남대로 415")).toBeInTheDocument();
    expect(screen.getByText("피부과")).toBeInTheDocument();
  });

  it("selected일 때 버튼의 aria-pressed가 true다", () => {
    render(<PlaceCard name="A" address="주소" selected />);
    expect(screen.getByRole("button", { pressed: true })).toBeInTheDocument();
  });

  it("클릭하면 onSelect가 호출된다", async () => {
    const onSelect = jest.fn();
    render(<PlaceCard name="A" address="주소" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
