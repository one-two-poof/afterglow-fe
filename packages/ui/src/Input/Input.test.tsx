import { render, screen } from "@testing-library/react";

import { Input } from "./Input";

describe("Input", () => {
  it("label을 통해 input에 접근할 수 있다 (htmlFor ↔ id 연결)", () => {
    render(<Input label="이메일" />);

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  });

  it("helperText를 렌더하고 input과 aria-describedby로 연결한다", () => {
    render(<Input label="비밀번호" helperText="8자 이상 입력하세요" />);

    const input = screen.getByLabelText("비밀번호");
    const helper = screen.getByText("8자 이상 입력하세요");

    expect(input).toHaveAttribute("aria-describedby", helper.id);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("error가 있으면 메시지를 보여주고 aria-invalid를 켠다", () => {
    render(<Input label="이메일" error="올바른 이메일 형식이 아닙니다" />);

    const input = screen.getByLabelText("이메일");
    const errorText = screen.getByText("올바른 이메일 형식이 아닙니다");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", errorText.id);
  });

  it("error와 helperText가 모두 있으면 error를 우선 표시한다", () => {
    render(
      <Input label="이메일" error="형식 오류" helperText="이메일을 입력하세요" />,
    );

    expect(screen.getByText("형식 오류")).toBeInTheDocument();
    expect(screen.queryByText("이메일을 입력하세요")).not.toBeInTheDocument();
  });

  it("네이티브 input 속성(type, placeholder)을 그대로 전달한다", () => {
    render(<Input label="비밀번호" type="password" placeholder="••••••••" />);

    const input = screen.getByLabelText("비밀번호");

    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "••••••••");
  });
});
