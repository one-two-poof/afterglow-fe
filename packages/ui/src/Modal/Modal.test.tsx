import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("open이 false면 아무것도 렌더하지 않는다", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <div>숨김 내용</div>
      </Modal>,
    );

    expect(screen.queryByText("숨김 내용")).not.toBeInTheDocument();
  });

  it("open이 true면 children을 렌더한다", () => {
    render(
      <Modal open onClose={() => {}}>
        <div>모달 내용</div>
      </Modal>,
    );

    expect(screen.getByText("모달 내용")).toBeInTheDocument();
  });

  it("ESC 키를 누르면 onClose를 호출한다", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <div>내용</div>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("오버레이(배경) 클릭 시 onClose를 호출한다", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <Modal.Body>내용</Modal.Body>
      </Modal>,
    );

    await user.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("모달 내부 클릭은 onClose를 호출하지 않는다 (stopPropagation)", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <Modal.Body>모달 내용</Modal.Body>
      </Modal>,
    );

    await user.click(screen.getByText("모달 내용"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("Modal.Close 클릭 시 onClose를 호출한다", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <Modal.Close>닫기</Modal.Close>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("열려 있는 동안 body 스크롤을 잠그고 닫으면 복원한다", () => {
    const { rerender } = render(
      <Modal open onClose={() => {}}>
        <div>내용</div>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} onClose={() => {}}>
        <div>내용</div>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("<Modal> 밖에서 Modal.Close를 쓰면 에러를 던진다", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Modal.Close />)).toThrow(
      "Modal 하위 컴포넌트는 <Modal> 안에서만 사용할 수 있습니다.",
    );

    spy.mockRestore();
  });
});
